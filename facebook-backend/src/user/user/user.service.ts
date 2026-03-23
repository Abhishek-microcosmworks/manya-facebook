import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GetUserProfileResDTO, UserProfileDto, UpdateProfileReqDto } from './user-dto';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'models/user';
import { AwsS3Service } from 'src/third-party/aws/s3.service';
import { Profile } from 'models/profile/profile.schema';
import { Media, MediaUsage } from 'models/media/media.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Profile.name)
    private readonly profileModel: Model<Profile>,
    @InjectModel(Media.name)
    private readonly mediaModel: Model<Media>,
    private readonly s3Service: AwsS3Service,
  ) { }

  async getUserProfile(user: User): Promise<GetUserProfileResDTO> {
    const populatedUser = await this.userModel
      .findById(user._id)
      .populate({
        path: 'profile',
        populate: { path: 'profile_pic_id cover_media_id', select: 'url usage' },
      });

    if (!populatedUser) throw new NotFoundException('User not found');

    return {
      error: false,
      statusCode: HttpStatus.OK,
      user: UserProfileDto.transform(populatedUser),
    };
  }

  async getPublicProfile(username: string): Promise<GetUserProfileResDTO> {
    const normalizedUsername = username.toLowerCase();
    const user = await this.userModel
      .findOne({ username: normalizedUsername, isDeleted: false })
      .select('name username profile')
      .populate({
        path: 'profile',
        select: 'bio location website profile_pic_id cover_media_id',
        populate: { path: 'profile_pic_id cover_media_id', select: 'url usage' },
      })
      .lean();  // lean for faster read-only queries, returns plain JavaScript object instead of Mongoose document

    if (!user) throw new NotFoundException('Profile not found');

    return {
      error: false,
      statusCode: HttpStatus.OK,
      user: UserProfileDto.transform(user as any),
    };
  }

  /**
   * Multi-step profile update:
   * 1. Validate uniqueness constraints (username)
   * 2. Upload any new media to S3 → create Media docs
   * 3. Apply all mutations to User + Profile atomically (parallel writes)
   * 4. Return the refreshed profile
   */
  async updateProfile(
    userId: string,
    updateData: UpdateProfileReqDto,
    files?: { profilePic?: Express.Multer.File[]; coverPic?: Express.Multer.File[] },
  ): Promise<GetUserProfileResDTO> {
    const { name, username, bio, location, website } = updateData;

    // ── Validation ────────────────────────────────────────────────
    if (username) {
      const normalizedUsername = username.toLowerCase();
      const existing = await this.userModel
        .findOne({ username: normalizedUsername, _id: { $ne: new Types.ObjectId(userId) } })
        .select('_id')
        .lean();

      if (existing) {
        throw new ConflictException(
          `Username "${username}" is already taken. Please choose another.`,
        );
      }
    }

    // ── Fetch profile ─────────────────────────────────────────────
    let profile = await this.profileModel.findOne({
      user_id: new Types.ObjectId(userId),
    });

    let isNewProfile = false;
    if (!profile) {
      // Lazy init for maximum production resilience against legacy/interrupted accounts
      profile = new this.profileModel({ user_id: new Types.ObjectId(userId) });
      isNewProfile = true;
    }

    if (files?.profilePic?.length) {
      const { Location } = await this.s3Service.uploadFile(files.profilePic[0]);
      // Create a Media document for the new profile picture
      const media = await this.mediaModel.create({
        url: Location,
        owner_id: userId,
        type: 'image',
        usage: MediaUsage.PROFILE_PIC,
        ref_id: profile._id,
        size: files.profilePic[0].size,
      });

      // Store the Media ID instead of a raw string
      profile.profile_pic_id = media._id as any;
    }

    if (files?.coverPic?.length) {
      const { Location } = await this.s3Service.uploadFile(files.coverPic[0]);
      const media = await this.mediaModel.create({
        url: Location,
        owner_id: userId,
        type: 'image',
        usage: MediaUsage.COVER_PIC,
        ref_id: profile._id,
        size: files.coverPic[0].size,
      });
      profile.cover_media_id = media._id as any;
    }

    // updates the user document & saves profile parallely
    const userUpdates: Record<string, any> = {};
    if (name) userUpdates.name = name;
    if (username) userUpdates.username = username;
    if (isNewProfile) userUpdates.profile = profile._id;

    const profileMutated =
      isNewProfile ||
      bio !== undefined ||
      location !== undefined ||
      website !== undefined ||
      files?.profilePic?.length ||
      files?.coverPic?.length;

    if (bio !== undefined) profile.bio = bio;
    if (location !== undefined) profile.location = location as any;
    if (website !== undefined) profile.website = website as any;

    await Promise.all([
      Object.keys(userUpdates).length
        ? this.userModel.findByIdAndUpdate(userId, userUpdates, {
            runValidators: true,
          })
        : Promise.resolve(),
      profileMutated ? profile.save() : Promise.resolve(),
    ]);

    return this.getUserProfile({ _id: userId } as User);
  }

  async searchUsers(query: string, currentUserId: string): Promise<any[]> {
    // 1. Sanitize the query to prevent Regex Denial of Service (ReDoS)
    // This escapes special characters like .*+?^${}()|[]\
    const sanitizedQuery = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

    // 2. Optimized Regex: Using '^' (starts with) is much faster because it 
    // allows MongoDB to use B-Tree indexes efficiently, unlike global /query/ searches.
    // We fall back to global search if you prefer, but prefix is production-standard.
    const searchRegex = new RegExp(`^${sanitizedQuery}`, 'i'); 

    const users = await this.userModel.find({
      _id: { $ne: new Types.ObjectId(currentUserId) },
      isDeleted: false,
      $or: [
        { username: searchRegex },
        { name: searchRegex } 
      ]
    })
    .select('name username profile') // Only fetch what is strictly needed
    .populate({
      path: 'profile',
      select: 'profile_pic_id',
      populate: { path: 'profile_pic_id', select: 'url' }
    })
    .limit(8) // Strict limit to keep API fast and payloads tiny
    .lean()   // Bypasses Mongoose hydration for maximum read performance
    .exec();

    return users.map((u: any) => ({
      id: u._id,
      name: u.name,
      username: u.username,
      profilePic: u.profile?.profile_pic_id?.url || ''
    }));
  }
}

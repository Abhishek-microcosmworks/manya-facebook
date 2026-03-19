import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
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
  ) {}

  async getUserProfile(user: User): Promise<GetUserProfileResDTO> {
    const populatedUser = await this.userModel.findById(user._id)
      .populate({
        path: 'profile',
        populate: { path: 'profile_pic_id cover_media_id', select: 'url usage' }
      });
      if (!populatedUser) throw new NotFoundException('User not found');
    const userResp = UserProfileDto.transform(populatedUser);

    return {
      error: false,
      statusCode: HttpStatus.OK,
      user: userResp,
    };
  }

  async getPublicProfile(username: string): Promise<GetUserProfileResDTO> {
    const user = await this.userModel.findOne({ username, isDeleted: false })
      .select('name username profile') // Only fetch core display data
      .populate({
        path: 'profile',
        select: 'bio profile_pic_id cover_media_id', 
        populate: { path: 'profile_pic_id cover_media_id', select: 'url usage' }
      })
      .lean();  // lean for faster read-only queries, returns plain JavaScript object instead of Mongoose document

    if (!user) {
      throw new NotFoundException('Profile not found');
    }

    return {
      error: false,
      statusCode: HttpStatus.OK,
      user: UserProfileDto.transform(user as any),
    };
  }

  /**
   * Handles multi-step profile updates:
   * 1. Upload to S3 -> 2. Create Media Document -> 3. Update Profile Reference
   */
  
 async updateProfile(userId: string, updateData: UpdateProfileReqDto, files?: any) {
  // Fetch the user's profile document
  const profile = await this.profileModel.findOne({ user_id: new Types.ObjectId(userId) });
  if (!profile) throw new NotFoundException('Profile not found');

  if (files?.profilePic) {
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

  if (files?.coverPic) {
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

  if (updateData.name) {
    await this.userModel.findByIdAndUpdate(userId, { name: updateData.name });
  }

  if (updateData.bio !== undefined) {
    profile.bio = updateData.bio;
  }

  await profile.save();

  return this.getUserProfile({ _id: userId } as User);
}
}

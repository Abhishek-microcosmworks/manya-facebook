import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { GetUserProfileResDTO, UserProfileDto, UpdateProfileReqDto } from './user-dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'models/user';
import { AwsS3Service } from 'src/third-party/aws/s3.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly s3Service: AwsS3Service,
  ) {}

  async getUserProfile(user: User): Promise<GetUserProfileResDTO> {
    const userResp = UserProfileDto.transform(user);

    return {
      error: false,
      statusCode: HttpStatus.OK,
      user: userResp,
    };
  }

  async getPublicProfile(username: string): Promise<GetUserProfileResDTO> {
    const profile = await this.userModel.findOne({ username, isDeleted: false })
      .select('name username bio profilePic coverPic friendCount') 
      .lean();  // lean for faster read-only queries, returns plain JavaScript object instead of Mongoose document

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return {
      error: false,
      statusCode: HttpStatus.OK,
      user: UserProfileDto.transform(profile as any),
    };
  }

  async updateProfile(userId: string, updateData: UpdateProfileReqDto, files?: any) {
    const updatePayload: any = { ...updateData };

    // If a new picture is uploaded, send it to S3
    if (files?.profilePic) {
      const { Location } = await this.s3Service.uploadFile(files.profilePic[0]);
      updatePayload.profilePic = Location;
    }

    if (files?.coverPic) {
      const { Location } = await this.s3Service.uploadFile(files.coverPic[0]);
      updatePayload.coverPic = Location;
    }

    // Update the user record in the database
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updatePayload },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return {
      error: false,
      statusCode: HttpStatus.OK,
      user: UserProfileDto.transform(updatedUser as any),
    };
  }
}

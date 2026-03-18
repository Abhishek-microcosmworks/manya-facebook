import { HttpStatus, Injectable } from '@nestjs/common';
import { GetUserProfileResDTO, UserProfileDto } from './user-dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'models/user';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async getUserProfile(user: User): Promise<GetUserProfileResDTO> {
    const userResp = UserProfileDto.transform(user);

    return {
      error: false,
      statusCode: HttpStatus.OK,
      user: userResp,
    };
  }
}

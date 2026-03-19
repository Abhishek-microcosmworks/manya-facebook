import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from 'models/user';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/auth/auth.module';
import { ThirdPartyModule } from 'src/third-party/third-party.module';
import { Profile, ProfileSchema } from 'models/profile/profile.schema';
import { Media, MediaSchema } from 'models/media/media.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Profile.name, schema: ProfileSchema },
      { name: Media.name, schema: MediaSchema }
    ]),
    CommonModule,
    AuthModule,
    ThirdPartyModule,
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { profile } from 'console';
import { ROLE_VALUES, User } from 'models/user/user.schema';

export class UserProfileDto {
  @ApiProperty({
    example: '123',
  })
  id: string;

  @ApiProperty({
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: true,
  })
  @IsBoolean()
  isEmailVerified: boolean;

  @ApiProperty({
    example: true,
  })
  @IsBoolean()
  isDeleted: boolean;

  @ApiProperty({
    example: true,
  })
  @IsBoolean()
  isAccountCompleted: boolean;

  @ApiProperty({ example: 'USER', enum: ROLE_VALUES })
  @IsEnum(ROLE_VALUES)
  role: ROLE_VALUES;

  @ApiProperty({ example: 'john.doe' })
  username: string;

  @ApiProperty({ example: 'Software Developer' })
  bio: string;

  @ApiProperty({ example: 'https://s3.amazonaws.com/bucket/profile.jpg' })
  profilePic: string;

  @ApiProperty({ example: 'https://s3.amazonaws.com/bucket/cover.jpg' })
  coverPic: string;

  @ApiProperty({ example: 150 })
  friendCount: number;

  static transform(object: any): UserProfileDto {
    const transformedObj: UserProfileDto = new UserProfileDto();

    transformedObj.id = object._id.toString();
    transformedObj.email = object.email;
    transformedObj.name = object.name;
    transformedObj.username = object.username || '';
    
    if (object.profile) {
      transformedObj.bio = object.profile.bio || '';
      transformedObj.profilePic = object.profile.profile_pic_id?.url || '';
      transformedObj.coverPic = object.profile.cover_media_id?.url || '';
    } 
    transformedObj.isEmailVerified = object.isEmailVerified;
    transformedObj.isAccountCompleted = object.isAccountCompleted;
    transformedObj.isDeleted = object.isDeleted;
    transformedObj.role = object.role;

    return transformedObj;
  }
}

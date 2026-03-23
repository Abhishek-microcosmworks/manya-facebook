import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { ROLE_VALUES, User } from 'models/user/user.schema';

export class UserProfileDto {
  @ApiProperty({ example: '123' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isEmailVerified: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  isDeleted: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  isAccountCompleted: boolean;

  @ApiProperty({ example: 'USER', enum: ROLE_VALUES })
  @IsEnum(ROLE_VALUES)
  role: ROLE_VALUES;

  @ApiProperty({ example: 'john.doe' })
  username: string;

  @ApiProperty({ example: 'Software Developer at Microcosmworks' })
  @IsOptional()
  bio: string;

  @ApiProperty({ example: 'San Francisco, CA' })
  @IsOptional()
  location: string;

  @ApiProperty({ example: 'https://johndoe.dev' })
  @IsOptional()
  website: string;

  @ApiProperty({ example: 'https://s3.amazonaws.com/bucket/profile.jpg' })
  profilePic: string;

  @ApiProperty({ example: 'https://s3.amazonaws.com/bucket/cover.jpg' })
  coverPic: string;

  @ApiProperty({ example: 150 })
  friendCount: number;

  static transform(object: any): UserProfileDto {
    const dto = new UserProfileDto();

    dto.id = object._id.toString();
    dto.email = object.email;
    dto.name = object.name;
    dto.username = object.username || '';
    dto.isEmailVerified = object.isEmailVerified;
    dto.isAccountCompleted = object.isAccountCompleted;
    dto.isDeleted = object.isDeleted;
    dto.role = object.role;

    if (object.profile) {
      dto.bio = object.profile.bio || '';
      dto.location = object.profile.location || '';
      dto.website = object.profile.website || '';
      dto.profilePic = object.profile.profile_pic_id?.url || '';
      dto.coverPic = object.profile.cover_media_id?.url || '';
    } else {
      dto.bio = '';
      dto.location = '';
      dto.website = '';
      dto.profilePic = '';
      dto.coverPic = '';
    }

    return dto;
  }
}

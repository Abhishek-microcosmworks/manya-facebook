import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator';
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

  static transform(object: User): UserProfileDto {
    const transformedObj: UserProfileDto = new UserProfileDto();

    transformedObj.id = object._id.toString();
    transformedObj.email = object.email;
    transformedObj.name = object.name;
    transformedObj.isEmailVerified = object.isEmailVerified;
    transformedObj.isAccountCompleted = object.isAccountCompleted;
    transformedObj.isDeleted = object.isDeleted;
    transformedObj.role = object.role;

    return transformedObj;
  }
}

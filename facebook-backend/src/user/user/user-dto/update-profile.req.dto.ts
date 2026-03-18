import { IsString, IsOptional, MaxLength, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileReqDto {
  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @ApiProperty({ example: 'john.doe', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9._]+$/, { 
    message: 'Username can only contain letters, numbers, dots, and underscores' 
  })
  username?: string;

  @ApiProperty({ example: 'Software Developer', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  bio?: string;
}
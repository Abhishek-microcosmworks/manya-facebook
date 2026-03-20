import { IsString, IsNotEmpty, IsOptional, IsEnum, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ description: 'Text content of the post' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ enum: ['public', 'friends', 'private'], required: false })
  @IsOptional()
  @IsEnum(['public', 'friends', 'private'])
  privacy?: string;

  @ApiProperty({ description: 'Optional media attached to the post', required: false })
  @IsOptional()
  @IsMongoId()
  media_id?: string;
}

export class CreateCommentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class CreateReplyDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;
}

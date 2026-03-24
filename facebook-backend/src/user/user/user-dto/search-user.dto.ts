import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchUserDto {
  @ApiProperty({ example: 'john', description: 'Search query' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Search query must be at least 2 characters long' })
  @MaxLength(50, { message: 'Search query is too long' })
  q: string;
}
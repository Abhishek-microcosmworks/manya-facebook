import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { MatchFieldValue, MatchRegex } from 'src/utils/validators';

export class RegisterReqDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'A valid email address.',
    required: true,
  })
  @MinLength(3, { message: 'Name must be of atleast 3 letters.' })
  @IsString({ message: 'Please provide a valid name.' })
  @IsNotEmpty({ message: 'Name is required.' })
  readonly name: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'A valid email address.',
    required: true,
  })
  @IsEmail({}, { message: 'Please provide a valid email.' })
  @IsNotEmpty({ message: 'Email is required.' })
  @Transform(({ value }) => value?.toLowerCase(), { toClassOnly: true })
  readonly email: string;

  @ApiProperty({
    example: 'Test@123',
    description:
      'Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character.',
    required: true,
  })
  @MatchRegex('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})')
  @IsNotEmpty({ message: 'Password is required.' })
  readonly password: string;

  @ApiProperty({
    example: 'Test@123',
    description:
      'Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character.',
    required: true,
  })
  @MatchFieldValue('password', { message: 'Passwords do not match.' })
  @MatchRegex('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})')
  @IsNotEmpty({ message: 'confirmPassword is required.' })
  readonly confirmPassword: string;

  @ApiProperty({
    example: true,
    description: 'Terms and Conditions Flag',
    required: true,
  })
  @IsBoolean()
  @IsNotEmpty({
    message: 'Please provide Terms and Conditions Flag is required.',
  })
  readonly acceptTerms: boolean;
}

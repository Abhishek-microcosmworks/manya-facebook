import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginReqDto {
  @ApiProperty({
    example: 'sample@gmail.com',
    description: 'Email of the user Account',
  })
  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsNotEmpty({ message: 'Please provide email' })
  @Transform(({ value }) => value.toLowerCase(), { toClassOnly: true })
  email: string;

  @ApiProperty({
    example: 'Test@123',
    description: 'Password of the user account',
  })
  @IsNotEmpty({
    message: 'Please provide password',
  })
  readonly password: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { MatchFieldValue, MatchRegex } from 'src/utils/validators';

export class ResetPassReqDTO {
  @ApiProperty({
    description: 'The new password for the user',
    example: 'newPassword123!',
  })
  @MatchRegex('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})')
  @IsString()
  @IsNotEmpty()
  newPass: string;

  @ApiProperty({
    description: 'Confirmation of the new password',
    example: 'newPassword123!',
  })
  @MatchFieldValue('newPass', { message: 'Passwords do not match.' })
  @MatchRegex('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})')
  @IsString()
  @IsNotEmpty()
  confirmNewPass: string;

  @ApiProperty({
    description: 'The token used to verify the password reset request',
    example: 'sacnaksckjascnaksc...',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

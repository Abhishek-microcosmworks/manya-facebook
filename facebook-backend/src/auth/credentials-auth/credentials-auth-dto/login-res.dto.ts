import { ApiProperty } from '@nestjs/swagger';
import { UserProfileDto } from 'src/user/user/user-dto';
import { BaseResponse } from 'src/utils/responses';

export class LoginResDto extends BaseResponse {
  @ApiProperty({
    example: 'Logged In successfully !!',
  })
  msg: string;

  @ApiProperty({
    example: 'Random value',
  })
  accessToken: string;

  @ApiProperty({
    example: 'timeStamp',
  })
  expiry: Date;

  @ApiProperty({
    type: UserProfileDto,
  })
  user: UserProfileDto;
}

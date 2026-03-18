import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from 'src/utils/responses';

export class LogoutResDto extends BaseResponse {
  @ApiProperty({
    example: 'User logged out successfully',
  })
  msg: string;
}

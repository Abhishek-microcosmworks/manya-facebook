import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from 'src/utils/responses';

export class forgotPassResDTO extends BaseResponse {
  @ApiProperty({
    description: 'Message indicating the status of the forgot password request',
    example: 'Password reset link sent successfully',
  })
  msg: string;
}

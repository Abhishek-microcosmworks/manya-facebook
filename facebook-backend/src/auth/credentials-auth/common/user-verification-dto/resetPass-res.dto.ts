import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from 'src/utils/responses';

export class ResetPassResDTO extends BaseResponse {
  @ApiProperty({
    type: String,
    example: 'Password reset successfully!',
    description:
      'Message indicating the status of the password reset operation',
  })
  msg: string;
}

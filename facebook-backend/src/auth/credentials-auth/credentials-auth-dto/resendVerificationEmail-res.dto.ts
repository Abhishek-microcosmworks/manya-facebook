import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from 'src/utils/responses';

export class ResendVerificationEmailResDTO extends BaseResponse {
  @ApiProperty({
    description:
      'Message indicating the result of the resend verification email operation',
    example: 'Verification email re-sent successfully',
  })
  msg: string;
}

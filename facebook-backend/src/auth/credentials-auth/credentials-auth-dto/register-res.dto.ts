import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from 'src/utils/responses';

export class RegisterResDto extends BaseResponse {
  @ApiProperty({
    description: 'Message to be sent in the response',
    example: 'User registered successfully',
  })
  msg: string;
}

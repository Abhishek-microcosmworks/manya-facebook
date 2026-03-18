import { ApiProperty } from '@nestjs/swagger';

export class BaseResponse {
  @ApiProperty({
    example: false,
    description: 'every time value is `false` for success response',
  })
  error: boolean = false;

  @ApiProperty({
    example: 400,
    description:
      'Http response code. 400-Bad Request, 403 - Forbidden Exception, 404 - Not Found, 500 - Internal Server Exception',
  })
  statusCode: number;
}

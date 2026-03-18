import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponse {
  @ApiProperty({
    example: true,
    description: 'every time value is `true` for error response',
  })
  error: boolean = true;

  @ApiProperty({
    example: 1605516011758,
    description: 'Error Id - It is unix timestamp of the error',
  })
  errorId: number = new Date().getTime();

  @ApiProperty({
    example: 400,
    description:
      'Http response code. 400-Bad Request, 403 - Forbidden Exception, 404 - Not Found, 500 - Internal Server Exception',
  })
  statusCode: number;

  @ApiProperty({
    example: '2020-11-16T08:40:11.758Z',
    description: 'Time at which error occurred',
  })
  timestamp: Date = new Date();

  @ApiProperty({
    example: '/path',
    description: 'API for which error encountered',
  })
  path: string;

  @ApiProperty({
    example: 'Error Message',
    description: 'Description about the error',
  })
  message: string;
}

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiTags('App') // Group the endpoint under "Health" in Swagger UI
@Controller()
export class AppController {
  @Get('/health')
  @ApiResponse({
    status: 200,
    description: 'Server is running',
    schema: {
      example: { status: 'ok', message: 'nestjs-starter server is running' },
    },
  })
  async getServerHealth() {
    return {
      status: 'ok',
      message: 'nestjs-starter server is running',
    };
  }
}

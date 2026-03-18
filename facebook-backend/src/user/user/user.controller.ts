import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorResponse } from 'src/utils/responses';
import { UserService } from './user.service';
import { Request } from 'express';
import { GetUserProfileResDTO } from './user-dto';
import { AuthGuard } from 'src/middlewares';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the user profile.',
    type: GetUserProfileResDTO,
  })
  @ApiResponse({
    status: 404,
    description: 'Error Response',
    type: ErrorResponse,
  })
  @Get('/profile')
  async getUserProfile(@Req() req: Request) {
    const user = req['user'];

    return this.userService.getUserProfile(user);
  }
}

import { Controller, Get, Query, Req, UseGuards, Patch, Body, UploadedFiles, Param, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { ErrorResponse } from 'src/utils/responses';
import { UserService } from './user.service';
import { Request } from 'express';
import { GetUserProfileResDTO, UpdateProfileReqDto, SearchUserDto } from './user-dto';
import { AuthGuard } from 'src/middlewares';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@ApiTags('User')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
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

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiConsumes('multipart/form-data') // Enables file upload UI in Swagger
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'profilePic', maxCount: 1 },
      { name: 'coverPic', maxCount: 1 },
    ]),
  )
  @ApiResponse({
    status: 200,
    description: 'Successfully updated the profile.',
    type: GetUserProfileResDTO,
  })
  @Patch('/profile/update')
  async updateProfile(
    @Req() req: Request,
    @Body() body: UpdateProfileReqDto,
    @UploadedFiles()
    files: {
      profilePic?: Express.Multer.File[];
      coverPic?: Express.Multer.File[];
    },
  ) {
    const userId = req['user'].id; // Extract ID from the authenticated user object
    return this.userService.updateProfile(userId, body, files);
  }

  /* Retrieves a public profile by username. 
   * This endpoint is public and does not require an AuthGuard.
   */
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the public profile.',
    type: GetUserProfileResDTO,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ErrorResponse,
  })
  @Get('/profile/:username')
  async getPublicProfile(@Param('username') username: string) {
    return this.userService.getPublicProfile(username);
  }
  
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiResponse({ status: 200, description: 'Search results' })
  @Get('/search')
  async searchUsers(@Req() req: Request, @Query() searchDto: SearchUserDto) {
    const userId = req['user'].id;
    return this.userService.searchUsers(searchDto.q, userId);
  }
}

import { Controller, Get, Post, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';
import { FriendsService } from './friends.service';
import { AuthGuard } from 'src/middlewares';
import { Request } from 'express';
import { FriendActionResDto, FriendStatusResDto } from './dto/friend-responses.dto';
import { FriendRequestDto } from './dto/friend-request.dto';

@ApiTags('Friends')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @ApiResponse({ status: 200, type: FriendStatusResDto })
  @Get('status/:targetId')
  async getStatus(@Req() req: Request, @Param() params: FriendRequestDto): Promise<FriendStatusResDto> {
    return this.friendsService.getFriendStatus(req['user'].id, params.targetId);
  }

  @ApiResponse({ status: 200, type: FriendActionResDto })
  @Post('request/:targetId')
  async sendRequest(@Req() req: Request, @Param() params: FriendRequestDto): Promise<FriendActionResDto> {
    return this.friendsService.sendRequest(req['user'].id, params.targetId);
  }

  @ApiResponse({ status: 200, type: FriendActionResDto })
  @Post('accept/:targetId')
  async acceptRequest(@Req() req: Request, @Param() params: FriendRequestDto): Promise<FriendActionResDto> {
    return this.friendsService.acceptRequest(req['user'].id, params.targetId);
  }

  @ApiResponse({ status: 200, type: FriendActionResDto })
  @Post('reject/:targetId')
  async rejectRequest(@Req() req: Request, @Param() params: FriendRequestDto): Promise<FriendActionResDto> {
    return this.friendsService.rejectRequest(req['user'].id, params.targetId);
  }

  @ApiResponse({ status: 200, type: FriendActionResDto })
  @Post('cancel/:targetId')
  async cancelRequest(@Req() req: Request, @Param() params: FriendRequestDto): Promise<FriendActionResDto> {
    return this.friendsService.cancelRequest(req['user'].id, params.targetId);
  }

  @ApiResponse({ status: 200, type: FriendActionResDto })
  @Delete('remove/:targetId')
  async removeFriend(@Req() req: Request, @Param() params: FriendRequestDto): Promise<FriendActionResDto> {
    return this.friendsService.removeFriend(req['user'].id, params.targetId);
  }

  @ApiResponse({ status: 200, type: FriendActionResDto })
  @Post('block/:targetId')
  async blockUser(@Req() req: Request, @Param() params: FriendRequestDto): Promise<FriendActionResDto> {
    return this.friendsService.blockUser(req['user'].id, params.targetId);
  }

  @ApiResponse({ status: 200, type: FriendActionResDto })
  @Delete('unblock/:targetId')
  async unblockUser(@Req() req: Request, @Param() params: FriendRequestDto): Promise<FriendActionResDto> {
    return this.friendsService.unblockUser(req['user'].id, params.targetId);
  }

  @Get('list')
  async getFriendsList(@Req() req: Request) {
    return this.friendsService.getFriendsList(req['user'].id);
  }

  @Get('requests')
  async getIncomingRequests(@Req() req: Request) {
    return this.friendsService.getIncomingRequests(req['user'].id);
  }

  @Get('blocks')
  async getBlocks(@Req() req: Request) {
    return this.friendsService.getBlocks(req['user'].id);
  }
}

import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { InteractionsService } from './interactions.service';
import { CreatePostDto, CreateCommentDto, CreateReplyDto } from './dto/feed.dto';
import { AuthGuard } from 'src/middlewares';
import { Request } from 'express';

@ApiTags('Posts')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly interactionsService: InteractionsService
  ) { }

  @Post()
  async createPost(@Req() req: Request, @Body() dto: CreatePostDto) {
    return this.postsService.createPost(req['user'].id, dto);
  }

  @Get('timeline')
  async getTimeline(@Req() req: Request, @Query('limit') limit?: number, @Query('cursor') cursor?: string) {
    return this.postsService.getTimeline(
      req['user'].id,
      limit ? parseInt(limit.toString()) : 20,
      cursor ? new Date(cursor) : undefined
    );
  }

  @Get('user/:userId')
  async getUserFeed(@Param('userId') userId: string, @Query('limit') limit?: number, @Query('cursor') cursor?: string) {
    return this.postsService.getUserFeed(
      userId,
      limit ? parseInt(limit.toString()) : 20,
      cursor ? new Date(cursor) : undefined
    );
  }

  @Get('saved')
  async getSavedPosts(@Req() req: Request) {
    return this.interactionsService.getSavedPosts(req['user'].id);
  }

  @Get(':postId')
  async getPost(@Param('postId') postId: string) {
    return this.postsService.getPostById(postId);
  }

  @Delete(':postId')
  async deletePost(@Req() req: Request, @Param('postId') postId: string) {
    return this.postsService.deletePost(req['user'].id, postId);
  }

  @Post(':id/save')
  async savePost(@Req() req: Request, @Param('id') id: string) {
    return this.interactionsService.savePost(req['user'].id, id);
  }

  @Delete(':id/save')
  async unsavePost(@Req() req: Request, @Param('id') id: string) {
    return this.interactionsService.unsavePost(req['user'].id, id);
  }

  // ================= SIMPLIFIED INTERACTIONS =================
  @Post(':id/like')
  async likePost(@Req() req: Request, @Param('id') id: string) {
    return this.interactionsService.likePost(req['user'].id, id);
  }

  @Delete(':id/like')
  async unlikePost(@Req() req: Request, @Param('id') id: string) {
    return this.interactionsService.unlikePost(req['user'].id, id);
  }

  @Post(':id/comment')
  async createComment(@Req() req: Request, @Param('id') id: string, @Body() dto: CreateCommentDto) {
    return this.interactionsService.createComment(req['user'].id, id, dto.content);
  }

  @Get(':id/comments')
  async getComments(@Param('id') id: string) {
    return this.interactionsService.getCommentsByPost(id);
  }

  @Post(':id/repost')
  async repost(@Req() req: Request, @Param('id') id: string) {
    return this.interactionsService.repost(req['user'].id, id);
  }

  @Delete(':id/repost')
  async unrepost(@Req() req: Request, @Param('id') id: string) {
    return this.interactionsService.unrepost(req['user'].id, id);
  }

  @Post(':id/share/:friendId')
  async sharePost(@Req() req: Request, @Param('id') postId: string, @Param('friendId') friendId: string) {
    return this.interactionsService.shareToFriend(req['user'].id, friendId, postId);
  }
}

@ApiTags('Comments')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('comments')
export class CommentsController {
  constructor(private readonly interactionsService: InteractionsService) { }

  @Delete(':id')
  async deleteComment(@Req() req: Request, @Param('id') id: string) {
    return this.interactionsService.deleteComment(req['user'].id, id);
  }

  @Post(':id/like')
  async likeComment(@Req() req: Request, @Param('id') id: string) {
    return this.interactionsService.likeComment(req['user'].id, id);
  }

  @Delete(':id/like')
  async unlikeComment(@Req() req: Request, @Param('id') id: string) {
    return this.interactionsService.unlikeComment(req['user'].id, id);
  }

  @Post(':id/reply')
  async createReply(@Req() req: Request, @Param('id') id: string, @Body() dto: CreateReplyDto) {
    return this.interactionsService.createReply(req['user'].id, id, dto.content);
  }

  @Get(':id/replies')
  async getReplies(@Param('id') id: string) {
    return this.interactionsService.getRepliesByComment(id);
  }

  @Delete('replies/:id')
  async deleteReply(@Req() req: Request, @Param('id') id: string) {
    return this.interactionsService.deleteReply(req['user'].id, id);
  }
}

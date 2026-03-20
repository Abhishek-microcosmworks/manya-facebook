import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from 'models/feed/post.schema';
import { Comment, CommentSchema } from 'models/feed/comment.schema';
import { Reply, ReplySchema } from 'models/feed/reply.schema';
import { Like, LikeSchema } from 'models/feed/like.schema';
import { Repost, RepostSchema } from 'models/feed/repost.schema';
import { Share, ShareSchema } from 'models/feed/share.schema';
import { Friendship, FriendshipSchema } from 'models/friends/friendship.schema';

import { PostsController, CommentsController } from './posts.controller';
import { PostsService } from './posts.service';
import { InteractionsService } from './interactions.service';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Reply.name, schema: ReplySchema },
      { name: Like.name, schema: LikeSchema },
      { name: Repost.name, schema: RepostSchema },
      { name: Share.name, schema: ShareSchema },
      { name: Friendship.name, schema: FriendshipSchema },
    ]),
    CommonModule,
    AuthModule,
  ],
  controllers: [PostsController, CommentsController],
  providers: [PostsService, InteractionsService],
  exports: [PostsService, InteractionsService],
})
export class FeedModule { }

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { FriendRequest, FriendRequestSchema } from 'models/friends/friend-request.schema';
import { Friendship, FriendshipSchema } from 'models/friends/friendship.schema';
import { Block, BlockSchema } from 'models/friends/block.schema';
import { User, UserSchema } from 'models/user';
import { CommonModule } from 'src/common/common.module'; // Add this
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FriendRequest.name, schema: FriendRequestSchema },
      { name: Friendship.name, schema: FriendshipSchema },
      { name: Block.name, schema: BlockSchema },
      { name: User.name, schema: UserSchema },
    ]),
    CommonModule,
    AuthModule,
  ],
  controllers: [FriendsController],
  providers: [FriendsService],
  exports: [FriendsService],
})
export class FriendsModule { }

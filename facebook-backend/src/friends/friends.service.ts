import { Injectable, NotFoundException, ConflictException, BadRequestException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FriendRequest, FriendRequestStatus } from 'models/friends/friend-request.schema';
import { Friendship } from 'models/friends/friendship.schema';
import { Block } from 'models/friends/block.schema';
import { User } from 'models/user';

export enum FriendStatus {
  NONE = 'none',
  PENDING_SENT = 'pending_sent',
  PENDING_RECEIVED = 'pending_received',
  FRIENDS = 'friends',
  BLOCKED = 'blocked',
  BLOCKED_BY = 'blocked_by', // You are blocked by them
}

@Injectable()
export class FriendsService {
  constructor(
    @InjectModel(FriendRequest.name) private requestModel: Model<FriendRequest>,
    @InjectModel(Friendship.name) private friendshipModel: Model<Friendship>,
    @InjectModel(Block.name) private blockModel: Model<Block>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  /**
   * Universal helper to get the strict relationship status between two users.
   */
  async getFriendStatus(currentUserId: string, targetUserId: string): Promise<{ status: FriendStatus }> {
    if (currentUserId === targetUserId) return { status: FriendStatus.NONE };

    // 1. Check Blocks
    const block = await this.blockModel.findOne({
      $or: [
        { user_id: currentUserId, blocked_user_id: targetUserId },
        { user_id: targetUserId, blocked_user_id: currentUserId }
      ]
    }).lean();

    if (block) {
      if (block.user_id.toString() === currentUserId) return { status: FriendStatus.BLOCKED };
      return { status: FriendStatus.BLOCKED_BY };
    }

    // 2. Check Friendships
    const isFriend = await this.friendshipModel.exists({
      user_id: currentUserId,
      friend_id: targetUserId
    });
    if (isFriend) return { status: FriendStatus.FRIENDS };

    // 3. Check Pending Requests
    const request = await this.requestModel.findOne({
      status: FriendRequestStatus.PENDING,
      $or: [
        { sender_id: currentUserId, receiver_id: targetUserId },
        { sender_id: targetUserId, receiver_id: currentUserId }
      ]
    }).lean();

    if (request) {
      if (request.sender_id.toString() === currentUserId) {
        return { status: FriendStatus.PENDING_SENT };
      } else {
        return { status: FriendStatus.PENDING_RECEIVED };
      }
    }

    return { status: FriendStatus.NONE };
  }

  async sendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) throw new BadRequestException("Cannot friend yourself");
    
    const { status } = await this.getFriendStatus(senderId, receiverId);
    if (status === FriendStatus.BLOCKED || status === FriendStatus.BLOCKED_BY) {
      throw new BadRequestException("Action not permitted");
    }
    if (status === FriendStatus.FRIENDS) throw new ConflictException("Already friends");
    if (status === FriendStatus.PENDING_SENT) throw new ConflictException("Request already sent");
    if (status === FriendStatus.PENDING_RECEIVED) {
      // If they already sent you a request, sending one back automatically accepts it!
      return this.acceptRequest(senderId, receiverId);
    }

    // Upsert equivalent for rejected overlapping 
    await this.requestModel.deleteOne({
      $or: [
        { sender_id: senderId, receiver_id: receiverId },
        { sender_id: receiverId, receiver_id: senderId }
      ]
    });

    await this.requestModel.create({
      sender_id: senderId,
      receiver_id: receiverId,
      status: FriendRequestStatus.PENDING
    });

    return { success: true, message: "Friend request sent" };
  }

  async acceptRequest(userId: string, senderId: string) {
    const req = await this.requestModel.findOne({
      sender_id: senderId,
      receiver_id: userId,
      status: FriendRequestStatus.PENDING
    });

    if (!req) throw new NotFoundException("Request not found");
    
    req.status = FriendRequestStatus.ACCEPTED;
    await req.save();

    // Insert 2-way friendship for O(1) reads
    await this.friendshipModel.insertMany([
      { user_id: req.sender_id, friend_id: req.receiver_id },
      { user_id: req.receiver_id, friend_id: req.sender_id }
    ]).catch(() => null); // ignore duplicate key errors if somehow already friends

    return { success: true, message: "Request accepted" };
  }

  async rejectRequest(userId: string, senderId: string) {
    const result = await this.requestModel.updateOne(
      { sender_id: senderId, receiver_id: userId, status: FriendRequestStatus.PENDING },
      { $set: { status: FriendRequestStatus.REJECTED } }
    );
    if (result.matchedCount === 0) throw new NotFoundException("Request not found");
    return { success: true, message: "Request rejected" };
  }

  async cancelRequest(userId: string, receiverId: string) {
    const result = await this.requestModel.deleteOne({
      sender_id: userId,
      receiver_id: receiverId,
      status: FriendRequestStatus.PENDING
    });
    if (result.deletedCount === 0) throw new NotFoundException("Request not found");
    return { success: true, message: "Request cancelled" };
  }

  async removeFriend(userId: string, friendId: string) {
    await this.friendshipModel.deleteMany({
      $or: [
        { user_id: userId, friend_id: friendId },
        { user_id: friendId, friend_id: userId }
      ]
    });
    // Also cleanup any past requests so they can friend again fresh
    await this.requestModel.deleteMany({
      $or: [
        { sender_id: userId, receiver_id: friendId },
        { sender_id: friendId, receiver_id: userId }
      ]
    });
    return { success: true, message: "Friend removed" };
  }

  async blockUser(userId: string, blockedId: string) {
    if (userId === blockedId) throw new BadRequestException("Cannot block yourself");

    // 1. Destroy friendships
    await this.removeFriend(userId, blockedId);

    // 2. Create block
    await this.blockModel.updateOne(
      { user_id: userId, blocked_user_id: blockedId },
      { $set: { user_id: userId, blocked_user_id: blockedId } },
      { upsert: true }
    );

    return { success: true, message: "User blocked" };
  }

  async unblockUser(userId: string, blockedId: string) {
    const result = await this.blockModel.deleteOne({ user_id: userId, blocked_user_id: blockedId });
    if (result.deletedCount === 0) throw new NotFoundException("User was not blocked");
    return { success: true, message: "User unblocked" };
  }

  async getFriendsList(userId: string) {
    // Single fast query thanks to 2-way denormalization
    const friendships = await this.friendshipModel.find({ user_id: userId })
      .populate('friend_id', 'name username profile') // Populate base user and profile reference
      .lean();
    
    // We need to populate the profile's profile_pic_id as well. We can do deep populate or populate after.
    return this.friendshipModel.populate(friendships, {
      path: 'friend_id.profile',
      select: 'profile_pic_id bio',
      populate: { path: 'profile_pic_id', select: 'url' }
    });
  }

  async getIncomingRequests(userId: string) {
    const requests = await this.requestModel.find({
      receiver_id: userId,
      status: FriendRequestStatus.PENDING
    })
      .populate('sender_id', 'name username profile')
      .lean();

    return this.requestModel.populate(requests, {
      path: 'sender_id.profile',
      select: 'profile_pic_id',
      populate: { path: 'profile_pic_id', select: 'url' }
    });
  }

  async getBlocks(userId: string) {
    const blocks = await this.blockModel.find({ user_id: userId })
      .populate('blocked_user_id', 'name username')
      .lean();
    return blocks;
  }
}

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from 'models/feed/post.schema';
import { Comment } from 'models/feed/comment.schema';
import { Reply } from 'models/feed/reply.schema';
import { Like } from 'models/feed/like.schema';
import { Repost } from 'models/feed/repost.schema';
import { Share } from 'models/feed/share.schema';

@Injectable()
export class InteractionsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Reply.name) private replyModel: Model<Reply>,
    @InjectModel(Like.name) private likeModel: Model<Like>,
    @InjectModel(Repost.name) private repostModel: Model<Repost>,
    @InjectModel(Share.name) private shareModel: Model<Share>,
  ) { }

  // ===================== LIKES =====================
  async likePost(userId: string, postId: string) {
    try {
      await this.likeModel.create({ user_id: userId, post_id: postId });

      // Dual-sync: Denormalize directly into post as per diagram, and increment metadata count
      await this.postModel.updateOne(
        { _id: postId },
        {
          $push: { likes: { user_id: userId, created_at: new Date() } }
        }
      );
      return { success: true, message: 'Post liked' };
    } catch (e: any) {
      if (e.code === 11000) throw new ConflictException('Already liked');
      throw e;
    }
  }

  async unlikePost(userId: string, postId: string) {
    const result = await this.likeModel.deleteOne({ user_id: userId, post_id: postId });
    if (result.deletedCount > 0) {
      await this.postModel.updateOne(
        { _id: postId },
        { $pull: { likes: { user_id: userId } } }
      );
    }
    return { success: true, message: 'Post unliked' };
  }

  async likeComment(userId: string, commentId: string) {
    try {
      await this.likeModel.create({ user_id: userId, comment_id: commentId });
      await this.commentModel.updateOne({ _id: commentId }, { $inc: { likes_count: 1 } });
      return { success: true };
    } catch (e: any) {
      if (e.code === 11000) throw new ConflictException('Already liked');
      throw e;
    }
  }

  async unlikeComment(userId: string, commentId: string) {
    const result = await this.likeModel.deleteOne({ user_id: userId, comment_id: commentId });
    if (result.deletedCount > 0) {
      await this.commentModel.updateOne({ _id: commentId }, { $inc: { likes_count: -1 } });
    }
    return { success: true, message: 'Comment unliked' };
  }

  // ===================== COMMENTS =====================
  async createComment(userId: string, postId: string, content: string) {
    const comment = await this.commentModel.create({ user_id: userId, post_id: postId, content });

    // Atomic synchronization
    await this.postModel.updateOne({ _id: postId }, { $inc: { comments_count: 1 } });

    return comment.populate('user_id', 'name username profile');
  }

  async createReply(userId: string, commentId: string, content: string) {
    const reply = await this.replyModel.create({ user_id: userId, comment_id: commentId, content });
    await this.commentModel.updateOne({ _id: commentId }, { $inc: { replies_count: 1 } });
    return reply.populate('user_id', 'name username profile');
  }

  async deleteComment(userId: string, commentId: string) {
    const comment = await this.commentModel.findOne({ _id: commentId, user_id: userId });
    if (!comment) throw new NotFoundException('Comment not found');
    await this.commentModel.deleteOne({ _id: commentId });
    // Atomic synchronization down
    await this.postModel.updateOne({ _id: comment.post_id }, { $inc: { comments_count: -1 } });
    return { success: true };
  }

  async deleteReply(userId: string, replyId: string) {
    const reply = await this.replyModel.findOne({ _id: replyId, user_id: userId });
    if (!reply) throw new NotFoundException('Reply not found');
    await this.replyModel.deleteOne({ _id: replyId });
    await this.commentModel.updateOne({ _id: reply.comment_id }, { $inc: { replies_count: -1 } });
    return { success: true };
  }

  // ===================== REPOSTS & SHARES =====================
  async repost(userId: string, postId: string) {
    try {
      // const repost = await this.repostModel.create({ user_id: userId, post_id: postId });
      const repost = await this.repostModel.create({
        user_id: new Types.ObjectId(userId),
        post_id: new Types.ObjectId(postId)
      });
      return { success: true, message: 'Reposted successfully', repost };
    } catch (e: any) {
      if (e.code === 11000) throw new ConflictException('Already reposted');
      throw e;
    }
  }

  async unrepost(userId: string, postId: string) {
    const result = await this.repostModel.deleteOne({ user_id: userId, post_id: postId });
    if (result.deletedCount === 0) throw new NotFoundException('Repost not found');
    return { success: true };
  }

  async shareToFriend(userId: string, friendId: string, postId: string) {
    const share = await this.shareModel.create({ user_id: userId, friend_id: friendId, post_id: postId });
    return { success: true, message: 'Post shared via message', share };
  }

  // GET FEED
  async getCommentsByPost(postId: string) {
    return this.commentModel.find({ post_id: postId })
      .populate('user_id', 'name username profile')
      .sort({ created_at: -1 })
      .lean();
  }

  async getRepliesByComment(commentId: string) {
    return this.replyModel.find({ comment_id: commentId })
      .populate('user_id', 'name username profile')
      .sort({ created_at: 1 }) // Chronological order is standard for replies
      .lean();
  }
}

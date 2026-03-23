import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from 'models/feed/post.schema';
import { Friendship } from 'models/friends/friendship.schema';
import { CreatePostDto } from './dto/feed.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Friendship.name) private friendModel: Model<Friendship>,
  ) { }

  async createPost(userId: string, dto: CreatePostDto) {
    const post = await this.postModel.create({
      // user_id: userId,
      user_id: new Types.ObjectId(userId),
      content: dto.content,
      privacy: dto.privacy,
      media_id: dto.media_id ? new Types.ObjectId(dto.media_id) : undefined,
    });
    return post.populate('user_id', 'name username profile');
  }

  async getPostById(postId: string) {
    const post = await this.postModel.findById(postId)
      .populate('user_id', 'name username profile')
      .lean();
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  // get posts of friends and user
  async getTimeline(userId: string, limit: number = 20, cursor?: Date) {
    const viewerUserId = userId;
    const viewerUserObjId = new Types.ObjectId(viewerUserId);

    const friends = await this.friendModel
      .find({ user_id: userId })
      .distinct('friend_id');

    // const matchIds = [userId, ...friends.map(id => id.toString())];
    const matchIds = [
      new Types.ObjectId(userId),
      ...friends.map(id => new Types.ObjectId(id.toString()))
    ];

    const dateFilter = cursor ? { created_at: { $lt: new Date(cursor) } } : {};

    const pipeline: any[] = [
      { $match: { user_id: { $in: matchIds }, ...dateFilter, privacy: { $ne: 'private' } } },
      { $addFields: { feed_type: 'post' } },

      {
        $unionWith: {
          coll: 'reposts',
          pipeline: [
            { $match: { user_id: { $in: matchIds }, ...dateFilter } },
            { $lookup: { from: 'posts', localField: 'post_id', foreignField: '_id', as: 'original' } },
            { $unwind: { path: '$original' } },
            { $match: { 'original.privacy': { $ne: 'private' } } },
            { $lookup: { from: 'users', localField: 'original.user_id', foreignField: '_id', as: 'original.author' } },
            { $unwind: { path: '$original.author', preserveNullAndEmptyArrays: true } },
            { $addFields: { feed_type: 'repost', original_post: '$original' } },
            { $project: { original: 0 } }
          ]
        }
      },

      { $sort: { created_at: -1 } },
      { $limit: limit },

      // 2. Hydrate author data with SAFETY
      { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'author' } },
      {
        $unwind: {
          path: '$author',
          preserveNullAndEmptyArrays: true // This ensures your posts show up even if the lookup fails!
        }
      },

      {
        $project: {
          'author.password_hash': 0,
          'author.email': 0,
          'original_post.author.password_hash': 0,
          'original_post.author.email': 0
        }
      }
    ];

    // Add saved-status for the viewer, so the UI can render bookmark state without conflicts.
    pipeline.push(
      {
        $addFields: {
          // For reposts we save/unsave based on the original post id.
          target_post_id: {
            $cond: [
              { $eq: ['$feed_type', 'repost'] },
              '$original_post._id',
              '$_id'
            ]
          }
        }
      },
      {
        $lookup: {
          from: 'savedposts',
          let: { postId: '$target_post_id', userId: viewerUserObjId },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$post_id', '$$postId'] },
                    { $eq: ['$user_id', '$$userId'] }
                  ]
                }
              }
            },
            { $limit: 1 }
          ],
          as: 'saved_hit'
        }
      },
      {
        $addFields: {
          is_saved: { $gt: [{ $size: '$saved_hit' }, 0] }
        }
      },
      { $project: { saved_hit: 0, target_post_id: 0 } }
    );

    const result = await this.postModel.aggregate(pipeline);
    // console.log('Timeline Result count:', result.length);
    return result;
  }

  // get posts of user
  async getUserFeed(viewerUserId: string, targetUserId: string, limit: number = 20, cursor?: Date) {
    const viewerUserObjId = new Types.ObjectId(viewerUserId);

    // const matchIds = [targetUserId];
    const matchIds = [new Types.ObjectId(targetUserId)];

    const dateFilter = cursor ? { created_at: { $lt: new Date(cursor) } } : {};

    const pipeline: any[] = [
      { $match: { user_id: { $in: matchIds }, ...dateFilter, privacy: { $ne: 'private' } } },
      { $addFields: { feed_type: 'post' } },
      {
        $unionWith: {
          coll: 'reposts',
          pipeline: [
            { $match: { user_id: { $in: matchIds }, ...dateFilter } },
            { $lookup: { from: 'posts', localField: 'post_id', foreignField: '_id', as: 'original' } },
            { $unwind: '$original' },
            { $match: { 'original.privacy': { $ne: 'private' } } },
            { $lookup: { from: 'users', localField: 'original.user_id', foreignField: '_id', as: 'original.author' } },
            { $unwind: { path: '$original.author', preserveNullAndEmptyArrays: true } },
            { $addFields: { feed_type: 'repost', original_post: '$original' } },
            { $project: { original: 0 } }
          ]
        }
      },
      { $sort: { created_at: -1 } },
      { $limit: limit },
      { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'author' } },
      // { $unwind: '$author' },
      {
        $unwind: {
          path: '$author',
          preserveNullAndEmptyArrays: true // Keeps the post even if the author lookup fails
        }
      },
      {
        $project: {
          'author.password_hash': 0, 'author.email': 0, 'original_post.author.password_hash': 0, 'original_post.author.email': 0
        }
      }
    ];

    // Add saved-status for the viewer, so the UI can render bookmark state correctly on refresh.
    pipeline.push(
      {
        $addFields: {
          target_post_id: {
            $cond: [
              { $eq: ['$feed_type', 'repost'] },
              '$original_post._id',
              '$_id'
            ]
          }
        }
      },
      {
        $lookup: {
          from: 'savedposts',
          let: { postId: '$target_post_id', userId: viewerUserObjId },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$post_id', '$$postId'] },
                    { $eq: ['$user_id', '$$userId'] }
                  ]
                }
              }
            },
            { $limit: 1 }
          ],
          as: 'saved_hit'
        }
      },
      {
        $addFields: {
          is_saved: { $gt: [{ $size: '$saved_hit' }, 0] }
        }
      },
      { $project: { saved_hit: 0, target_post_id: 0 } }
    );

    const result = await this.postModel.aggregate(pipeline);
    // console.log('UserFeed Result count:', result.length);
    return result;
  }

  async deletePost(userId: string, postId: string) {
    const result = await this.postModel.deleteOne({ _id: postId, user_id: userId });
    if (result.deletedCount === 0) throw new NotFoundException('Post not found or unauthorized');
    return { success: true };
  }
}
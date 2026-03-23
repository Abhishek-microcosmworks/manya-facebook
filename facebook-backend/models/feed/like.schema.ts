import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Like extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Post' })
  post_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Comment' })
  comment_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Reply' })
  commentReply_id: Types.ObjectId;

  @Prop({ type: Boolean, required: true, default: true })
  like: boolean; // Tracking if it's a positive like
}

export const LikeSchema = SchemaFactory.createForClass(Like);

// Production constraints: A user can only like a specific entity once
LikeSchema.index(
  { user_id: 1, post_id: 1 }, 
  { unique: true, partialFilterExpression: { post_id: { $exists: true } } }
);

LikeSchema.index(
  { user_id: 1, comment_id: 1 }, 
  { unique: true, partialFilterExpression: { comment_id: { $exists: true } } }
);

LikeSchema.index(
  { user_id: 1, commentReply_id: 1 }, 
  { unique: true, partialFilterExpression: { commentReply_id: { $exists: true } } }
);

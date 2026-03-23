import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Comment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Post', required: true, index: true })
  post_id: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  // Optimization: Denormalized caches for O(1) rendering
  @Prop({ type: Number, default: 0 })
  likes_count: number;

  @Prop({ type: Number, default: 0 })
  replies_count: number;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.index({ post_id: 1, created_at: -1 });

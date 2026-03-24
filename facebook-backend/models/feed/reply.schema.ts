import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Reply extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Comment', required: true, index: true })
  comment_id: Types.ObjectId;

  @Prop({ default: '' })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  media_id: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  likes_count: number;
}

export const ReplySchema = SchemaFactory.createForClass(Reply);
ReplySchema.index({ comment_id: 1, created_at: 1 });

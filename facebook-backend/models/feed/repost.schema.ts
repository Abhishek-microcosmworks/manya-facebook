import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Repost extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Post', required: true, index: true })
  post_id: Types.ObjectId;
}

export const RepostSchema = SchemaFactory.createForClass(Repost);
// Prevent spam double-reposting
RepostSchema.index({ user_id: 1, post_id: 1 }, { unique: true });

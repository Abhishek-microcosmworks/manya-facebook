import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
class LikeMeta {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ default: Date.now })
  created_at: Date;
}

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Post extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ type: String, enum: ['public', 'friends', 'private'], default: 'public' })
  privacy: string;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  media_id: Types.ObjectId;

  // Diagram specific: Denormalized likes array for instant read operations 
  // without heavily querying the isolated Likes collection
  @Prop({ type: [LikeMeta], default: [] })
  likes: LikeMeta[];

  // Production optimization: direct count cache 
  @Prop({ type: Number, default: 0 })
  comments_count: number;
}

export const PostSchema = SchemaFactory.createForClass(Post);
// Index for fast timeline fetches (sort by newest)
PostSchema.index({ created_at: -1 });
// Index for user profile feeds
PostSchema.index({ user_id: 1, created_at: -1 });

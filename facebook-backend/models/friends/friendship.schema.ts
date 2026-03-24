import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Friendship extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  friend_id: Types.ObjectId;
}

export const FriendshipSchema = SchemaFactory.createForClass(Friendship);

// Production Optimization: Denormalized two-way edges means user_id to friend_id 
// will be unique, preventing duplicate friendship entries.
FriendshipSchema.index({ user_id: 1, friend_id: 1 }, { unique: true });

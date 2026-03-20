import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum FriendRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class FriendRequest extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  sender_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  receiver_id: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(FriendRequestStatus),
    default: FriendRequestStatus.PENDING,
  })
  status: FriendRequestStatus;
}

export const FriendRequestSchema = SchemaFactory.createForClass(FriendRequest);

// Production Optimization: Enforce unique sender-receiver combinations at the DB level
// A sender cannot have multiple active or pending requests to the same receiver.
FriendRequestSchema.index({ sender_id: 1, receiver_id: 1 }, { unique: true });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Block extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  blocked_user_id: Types.ObjectId;
}

export const BlockSchema = SchemaFactory.createForClass(Block);

// Production Optimization: Prevent duplicate block records
BlockSchema.index({ user_id: 1, blocked_user_id: 1 }, { unique: true });

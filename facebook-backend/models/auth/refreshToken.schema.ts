import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'models/user';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class RefreshToken extends Document {
  @Prop({ type: String, required: true })
  token: string;

  @Prop({ type: Date, required: true })
  expiry: Date;

  @Prop({ type: Boolean, default: false })
  isExpired: boolean;

  @Prop({ type: Types.ObjectId, required: true, ref: User.name })
  userId: Types.ObjectId;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

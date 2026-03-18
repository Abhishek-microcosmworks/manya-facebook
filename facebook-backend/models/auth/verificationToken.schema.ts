import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'models/user';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class VerificationToken extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  token: string;

  @Prop({ type: Date, required: true })
  expiry: Date;

  @Prop({ type: Boolean, default: false })
  isExpired: boolean;

  @Prop({ type: String, required: false })
  newEmail: string; // for email change verification token
}

export const VerificationTokenSchema =
  SchemaFactory.createForClass(VerificationToken);

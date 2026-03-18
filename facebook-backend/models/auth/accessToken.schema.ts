import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { RefreshToken } from './refreshToken.schema';
import { User } from 'models/user';

@Schema({ timestamps: true })
export class AccessToken extends Document {
  @Prop({ type: String, required: true })
  token: string;

  @Prop({ type: Date, required: true })
  expiry: Date;

  @Prop({ type: Boolean, default: false })
  isExpired: boolean;

  @Prop({ type: Types.ObjectId, required: true, ref: RefreshToken.name })
  refreshTokenId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: User.name })
  userId: Types.ObjectId;
}

export const AccessTokenSchema = SchemaFactory.createForClass(AccessToken);

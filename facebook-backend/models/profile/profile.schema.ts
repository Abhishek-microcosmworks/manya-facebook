import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Profile extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  user_id: Types.ObjectId;

  @Prop({ type: String, maxlength: 160, default: '' })
  bio: string;

  @Prop({ type: String, maxlength: 100, default: '' })
  location: string;

  @Prop({ type: String, maxlength: 200, default: '' })
  website: string;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  profile_pic_id: Types.ObjectId; // Ref to Media collection

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  cover_media_id: Types.ObjectId;
}
export const ProfileSchema = SchemaFactory.createForClass(Profile);
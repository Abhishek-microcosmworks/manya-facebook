import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/** Describes the purpose/context of a media file. */
export enum MediaUsage {
  PROFILE_PIC = 'profile_pic',
  COVER_PIC = 'cover_pic',
  POST = 'post',
  STORY = 'story',
  MESSAGE = 'message',
  OTHER = 'other',     // fallback   
}

@Schema({ timestamps: true })
export class Media extends Document {
  @Prop({ type: String, required: true })
  url: string; // S3 URL

  @Prop({ type: String, enum: ['image', 'video', 'gif'], default: 'image' })
  type: string;

  @Prop({
    type: String,
    enum: Object.values(MediaUsage),
    required: true,
    index: true,
  })
  usage: MediaUsage;

  @Prop({ type: Types.ObjectId, index: true })
  ref_id?: Types.ObjectId; // ID of the owning document (Post, Profile, etc.)

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  owner_id: Types.ObjectId; // User who uploaded it

  @Prop({ type: Number })
  size: number; // File size in bytes
}

export const MediaSchema = SchemaFactory.createForClass(Media);
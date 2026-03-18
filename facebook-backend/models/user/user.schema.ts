import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as argon2 from 'argon2';

export enum ROLE_VALUES {
  ADMIN = 'admin',
  USER = 'user',
}


@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ 
    type: String, 
    unique: true, 
    sparse: true,  // Allows multiple null values, but enforces uniqueness for non-null values
    index: true,  // Production-grade indexing for fast lookups
    trim: true,
    lowercase: true 
  })
  username: string;

  @Prop({
    type: String,
    required: true,
    minlength: [8, 'password must be of atleast 8 letters !!'],
    select: false,
  })
  password: string;

  @Prop({ type: String, enum: ROLE_VALUES, default: ROLE_VALUES.USER })
  role: ROLE_VALUES;

  @Prop({
    type: String,
    required: false,
    minlength: [3, 'name must be of atleast 3 letters !!'],
  })
  name: string;

  @Prop({ type: String, maxlength: 160 })
  bio: string;

  @Prop({ type: String })
  profilePic: string; // Stores the S3 URL

  @Prop({ type: String })
  coverPic: string; // Stores the S3 URL

  @Prop({ type: Number, default: 0 })
  friendCount: number; 

  @Prop({ type: Boolean, default: false })
  isEmailVerified: boolean;

  @Prop({ type: Boolean, default: false })
  isAccountCompleted: boolean;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Boolean, required: true })
  acceptTerms: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next) {
  const user = this as any;

  if (user.password) {
    user.password = await argon2.hash(user.password);
  }

  next();
});

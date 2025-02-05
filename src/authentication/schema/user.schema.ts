import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

export type UserDocument = User & Document;

@Schema({
  timestamps: true, // Cela ajoutera automatiquement createdAt et updatedAt
})
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  twoFactorSecret?: string;

  @Prop()
  publicKey?: string;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Prop({ default: false })
  isVerified: boolean;

}

export const UserSchema = SchemaFactory.createForClass(User);

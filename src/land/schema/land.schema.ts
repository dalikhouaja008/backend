import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../authentication/entities/user.entity';

export enum LandType {
  AGRICULTURAL = 'AGRICULTURAL',
  URBAN = 'URBAN',
}

export enum LandStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema()
export class Land extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true, enum: LandType })
  type: LandType;

  @Prop({ required: true, enum: LandStatus, default: LandStatus.PENDING })
  status: LandStatus;

  @Prop({ required: true })
  price: number;

  @Prop()
  imageUrl?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  owner: User;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const LandSchema = SchemaFactory.createForClass(Land);

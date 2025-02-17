import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../authentication/schema/user.schema';  

export type LandDocument = Land & Document;

@Schema({ timestamps: true })
export class Land {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  location: string;

  @Prop({ type: [String] })
  photos: string[];

  @Prop({ type: [String] })
  documents: string[];

  @Prop()
  size: number;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true }) 
  owner: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const LandSchema = SchemaFactory.createForClass(Land);

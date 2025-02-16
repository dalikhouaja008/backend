import {
  Field,
  ObjectType,
  ID,
  Float,
  registerEnumType,
} from '@nestjs/graphql';
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

registerEnumType(LandType, {
  name: 'LandType',
  description: 'Type of land property',
});

registerEnumType(LandStatus, {
  name: 'LandStatus',
  description: 'Status of land listing',
});

@ObjectType()
@Schema({ timestamps: true })
export class Land extends Document {
  @Field(() => ID)
  _id: string;

  @Field()
  @Prop({ required: true })
  title: string;

  @Field()
  @Prop({ required: true })
  description: string;

  @Field()
  @Prop({ required: true })
  location: string;

  @Field(() => LandType)
  @Prop({ type: String, enum: LandType, required: true })
  type: LandType;

  @Field(() => LandStatus)
  @Prop({ type: String, enum: LandStatus, default: LandStatus.PENDING })
  status: LandStatus;

  @Field(() => Float)
  @Prop({ required: true })
  price: number;

  @Field({ nullable: true })
  @Prop()
  imageUrl?: string;

  @Field(() => User)
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  owner: User;

  @Field(() => Date)
  @Prop({ default: Date.now })
  createdAt: Date;

  @Field(() => Date)
  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const LandSchema = SchemaFactory.createForClass(Land);

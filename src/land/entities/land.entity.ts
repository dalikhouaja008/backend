import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { LandType, LandStatus } from '../schema/land.types';

@ObjectType()
export class Land {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  location: string;

  @Field(() => LandType)
  type: LandType;

  @Field(() => LandStatus)
  status: LandStatus;

  @Field(() => Float)
  price: number;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => Date)
  createdAt: Date;
}

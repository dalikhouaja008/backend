import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { LandStatus, LandType } from '../schema/land.schema';
import { User } from '../../authentication/entities/user.entity';

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

  @Field(() => String)
  type: LandType;

  @Field(() => String)
  status: LandStatus;

  @Field(() => Float)
  price: number;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => User)
  owner: User;

  @Field()
  createdAt: Date;
}

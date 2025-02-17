import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { User } from '../../authentication/schema/user.schema';  // Adjust path if necessary

@ObjectType()
export class Land {
  @Field(() => ID)
  _id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  location: string;

  @Field(() => [String], { nullable: true })
  photos?: string[];

  @Field(() => [String], { nullable: true })
  documents?: string[];

  @Field(() => Int)
  size: number;

  @Field(() => User) 
  owner: User;

  @Field(() => Date)
  createdAt: Date;
}

import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

// Register the enum with GraphQL
registerEnumType(UserRole, {
  name: 'UserRole', // This is the name that will be used in the GraphQL schema
  description: 'User role enumeration', // Optional description
});

@ObjectType()
export class User {
  @Field(() => ID)
  id: number;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  twoFactorSecret?: string;

  @Field({ nullable: true })
  publicKey?: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field()
  isVerified: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
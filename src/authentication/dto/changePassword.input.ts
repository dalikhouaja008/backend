import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class ChangePasswordInput {
  @Field()
  userId: string;

  @Field()
  oldPassword: string;

  @Field()
  newPassword: string;
}
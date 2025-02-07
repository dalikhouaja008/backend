import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../schema/user.schema';


@ObjectType()
export class LoginResponse {
  @Field(() => String, { description: "JWT Access Token" })
  accessToken: string;

  @Field(() => String, { description: "JWT Refresh Token" })
  refreshToken: string;

  @Field(() => User, { description: "Informations de l'utilisateur" })
  user: User;
}
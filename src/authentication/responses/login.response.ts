import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../schema/user.schema';

@ObjectType()
export class LoginResponse {
  @Field(() => String, { nullable: true, description: 'JWT Access Token' })
  accessToken: string;

  @Field(() => String, { nullable: true, description: 'JWT Refresh Token' })
  refreshToken: string;

  @Field(() => Boolean, { description: 'Indique si la 2FA est requise' })
  requiresTwoFactor: boolean;

  @Field({
    nullable: true,
    description: 'token générer lors de la validation 2FA',
  })
  tempToken?: string;

  @Field(() => User, {
    nullable: true,
    description: "Informations de l'utilisateur",
  })
  user: User;
}

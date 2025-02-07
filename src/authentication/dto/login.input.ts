import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class LoginInput {
  @Field(() => String, { description: "Adresse e-mail de l'utilisateur" })
  email: string;

  @Field(() => String, { description: "Mot de passe de l'utilisateur" })
  password: string;
}
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UserInput {
  @Field(() => String, { description: "Nom d'utilisateur" })
  username: string;

  @Field(() => String, { description: "Adresse e-mail de l'utilisateur" })
  email: string;

  @Field(() => String, { description: "Mot de passe de l'utilisateur" })
  password: string;

  @Field(() => String, {
    description: "Rôle de l'utilisateur (par exemple, 'user', 'admin')",
    nullable: true, // Optionnel
  })
  role?: string;

  @Field(() => String, {
    description: "Clé publique de la wallet de l'utilisateur",
    nullable: true, // Optionnel
  })
  publicKey?: string;

  @Field(() => String, {
    description: "Secret pour l'authentification à deux facteurs",
    nullable: true, // Optionnel
  })
  twoFactorSecret?: string;

  @Field(() => Boolean, {
    description: "Indique si l'utilisateur est vérifié",
    defaultValue: false, // Valeur par défaut
  })
  isVerified?: boolean;
}
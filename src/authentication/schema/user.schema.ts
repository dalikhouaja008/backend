import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

export type UserDocument = User & Document;

@Schema({ timestamps: true })
@ObjectType() // Décorateur GraphQL pour définir un type d'objet
export class User {
  @Field(() => ID) // Décorateur GraphQL pour exposer le champ
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  @Field(() => String, { description: "Nom d'utilisateur" }) // Décorateur GraphQL
  username: string;

  @Prop({ required: true, unique: true })
  @Field(() => String, { description: "Adresse e-mail de l'utilisateur" }) // Décorateur GraphQL
  email: string;

  @Prop({ required: true })
  @Field(() => String, { description: "Mot de passe de l'utilisateur" }) // Décorateur GraphQL
  password: string;

  @Prop()
  @Field(() => String, {
    description: "Secret pour l'authentification à deux facteurs",
    nullable: true, // Optionnel
  })
  twoFactorSecret?: string;

  @Prop()
  @Field(() => String, {
    description: "Clé publique de la wallet de l'utilisateur",
    nullable: true, // Optionnel
  })
  publicKey?: string;

  @Prop({ required: false, type: SchemaTypes.ObjectId })
  @Field(() => ID, {
    description: "ID du rôle de l'utilisateur",
    nullable: true, // Optionnel
  })
  roleId?: Types.ObjectId;

  @Prop({ default: false })
  @Field(() => Boolean, {
    description: "Indique si l'utilisateur est vérifié",
    defaultValue: false, // Valeur par défaut
  })
  isVerified: boolean;

  @Field(() => Date, { description: 'Date de création du compte' }) // Décorateur GraphQL
  createdAt: Date;

  @Field(() => Date, { description: 'Date de mise à jour du compte' }) // Décorateur GraphQL
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
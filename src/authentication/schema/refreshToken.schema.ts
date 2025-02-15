import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
@ObjectType() // Décorateur GraphQL pour définir un type d'objet
export class RefreshToken extends Document {
  @Field(() => ID) // Décorateur GraphQL pour exposer le champ
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  @Field(() => String, { description: 'Le token de rafraîchissement' }) // Décorateur GraphQL
  token: string;

  @Prop({ required: true, type: mongoose.Types.ObjectId })
  @Field(() => ID, { description: "L'ID de l'utilisateur associé" }) // Décorateur GraphQL
  userId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  @Field(() => Date, { description: "La date d'expiration du token" }) // Décorateur GraphQL
  expiryDate: Date;

  @Field(() => Date, { description: 'La date de création du token' }) // Décorateur GraphQL
  createdAt: Date;

  @Field(() => Date, { description: 'La date de mise à jour du token' }) // Décorateur GraphQL
  updatedAt: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

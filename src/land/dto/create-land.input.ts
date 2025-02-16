import { InputType, Field, Float } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { LandType } from '../schema/land.types';

@InputType()
export class CreateLandInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  description: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  location: string;

  @Field(() => LandType)
  @IsNotEmpty()
  @IsEnum(LandType)
  type: LandType;

  @Field(() => Float)
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

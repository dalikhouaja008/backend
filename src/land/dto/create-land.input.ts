import { Field, InputType, Float } from '@nestjs/graphql';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { LandType } from '../schema/land.schema';

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

  @Field(() => String)
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

import { Field, InputType, Float } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { LandType, LandStatus } from '../schema/land.types';

@InputType()
export class PriceRangeInput {
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  min?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  max?: number;
}

@InputType()
export class FilterLandInput {
  @Field(() => LandType, { nullable: true })
  @IsOptional()
  @IsEnum(LandType)
  type?: LandType;

  @Field(() => LandStatus, { nullable: true })
  @IsOptional()
  @IsEnum(LandStatus)
  status?: LandStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field(() => PriceRangeInput, { nullable: true })
  @IsOptional()
  price?: PriceRangeInput;
}

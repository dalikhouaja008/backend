import { InputType, Int, Field } from '@nestjs/graphql';
import { IsString, IsArray, IsOptional, IsNumber } from 'class-validator';

@InputType()
export class CreateLandInput {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String)
  @IsString()
  location: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  photos?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  documents?: string[];

  @Field(() => Int)
  @IsNumber()
  size: number;
}

import { CreateLandInput } from './create-land.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateLandInput extends PartialType(CreateLandInput) {
  @Field(() => Int)
  id: number;
}

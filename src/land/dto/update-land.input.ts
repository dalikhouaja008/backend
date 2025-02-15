import { InputType, PartialType } from '@nestjs/graphql';
import { CreateLandInput } from './create-land.input';

@InputType()
export class UpdateLandInput extends PartialType(CreateLandInput) {}

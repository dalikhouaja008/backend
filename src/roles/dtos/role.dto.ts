import { InputType, Field } from '@nestjs/graphql';
import { Resource } from '../enums/resource.enum';
import { Action } from '../enums/action.enum';

// Define el tipo Permission como un InputType (para inputs)
@InputType()
export class PermissionInput {
  @Field(() => Resource)
  resource: Resource;

  @Field(() => [Action])
  actions: Action[];
}

// Define el tipo CreateRoleDto como un InputType (para inputs)
@InputType()
export class CreateRoleDtoInput {
  @Field()
  name: string;

  @Field(() => [PermissionInput])
  permissions: PermissionInput[];
}

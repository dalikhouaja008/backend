import { ObjectType, Field } from '@nestjs/graphql';
import { Resource } from '../enums/resource.enum';
import { Action } from '../enums/action.enum';
import { SchemaFactory } from '@nestjs/mongoose';

// Define el tipo Permission como un ObjectType (para consultas)
@ObjectType()
export class PermissionType {
    @Field(() => Resource)
    resource: Resource;

    @Field(() => [Action])
    actions: Action[];
}

// Define el tipo Role como un ObjectType (para consultas)
@ObjectType()
export class RoleType {
    @Field()
    name: string;

    @Field(() => [PermissionType])
    permissions: PermissionType[];
}
export const RoleSchema = SchemaFactory.createForClass(RoleType);


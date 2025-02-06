import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { RolesService } from './roles.service';
import { RoleType } from './schemas/role.schema';
import { CreateRoleDtoInput } from './dtos/role.dto';

@Resolver('Roles')
export class RolesResolver {

  constructor(private readonly rolesService: RolesService) {}

  // Simula una función que crea roles.
  
  @Mutation(() => RoleType)  // Spécifiez explicitement le type de retour
  async create(@Args('input') input: CreateRoleDtoInput): Promise<RoleType> {
    return this.rolesService.createRole(input);
  }
}

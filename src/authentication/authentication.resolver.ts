import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AuthenticationService } from './authentication.service';
import { CreateAuthenticationInput } from './dto/create-authentication.input';
import { UpdateAuthenticationInput } from './dto/update-authentication.input';
import { User } from './entities/user.entity';

//Les resolvers sont l'équivalent des contrôleurs dans une API REST.
@Resolver(() => User)
export class AuthenticationResolver {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Mutation(() => User)
  createAuthentication(@Args('createAuthenticationInput') createAuthenticationInput: CreateAuthenticationInput) {
    return this.authenticationService.create(createAuthenticationInput);
  }

  @Query(() => [User], { name: 'authentication' })
  findAll() {
    return this.authenticationService.findAll();
  }

  @Query(() => User, { name: 'authentication' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.authenticationService.findOne(id);
  }

  @Mutation(() => User)
  updateAuthentication(@Args('updateAuthenticationInput') updateAuthenticationInput: UpdateAuthenticationInput) {
    return this.authenticationService.update(updateAuthenticationInput.id, updateAuthenticationInput);
  }

  @Mutation(() => User)
  removeAuthentication(@Args('id', { type: () => Int }) id: number) {
    return this.authenticationService.remove(id);
  }
}

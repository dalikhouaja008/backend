import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { LandService } from './land.service';
import { Land } from './entities/land.entity';
import { CreateLandInput } from './dto/create-land.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwtAuth.guards';


@Resolver(() => Land)
export class LandResolver {
  constructor(private readonly landService: LandService) {}

  @Mutation(() => Land)
  @UseGuards(JwtAuthGuard)
  async createLand(
    @Args('createLandInput') createLandInput: CreateLandInput,
    @Context() context,
  ) {
    const user = context.req.user;  // Extracted from JWT token
    return this.landService.create(createLandInput, user._id);
  }

  @Query(() => [Land], { name: 'getAllLands' })
  findAll() {
    return this.landService.findAll();
  }

  @Query(() => Land, { name: 'getLand' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.landService.findOne(id);
  }
}

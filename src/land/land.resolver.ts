import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { LandService } from './land.service';
import { Land } from './entities/land.entity';
import { CreateLandInput } from './dto/create-land.input';
import { UpdateLandInput } from './dto/update-land.input';
import { JwtAuthGuard } from '../guards/jwtAuth.guards';
import { LandStatus } from './schema/land.types';
import { FilterLandInput } from './dto/filter-land.input';

@Resolver(() => Land)
export class LandResolver {
  constructor(private readonly landService: LandService) {}

  @Mutation(() => Land)
  @UseGuards(JwtAuthGuard)
  createLand(
    @Args('createLandInput') createLandInput: CreateLandInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.landService.create(createLandInput, userId);
  }

  @Query(() => [Land], { name: 'lands' })
  findAll(@Args('filters', { nullable: true }) filters?: FilterLandInput) {
    return this.landService.findAll(filters);
  }

  @Query(() => Land, { name: 'land' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.landService.findOne(id);
  }

  @Query(() => [Land], { name: 'myLands' })
  @UseGuards(JwtAuthGuard)
  findMyLands(@Context() context) {
    const userId = context.req.user.id;
    return this.landService.findByOwner(userId);
  }

  @Mutation(() => Land)
  @UseGuards(JwtAuthGuard)
  updateLand(
    @Args('id', { type: () => String }) id: string,
    @Args('updateLandInput') updateLandInput: UpdateLandInput,
  ) {
    return this.landService.update(id, updateLandInput);
  }

  @Mutation(() => Land)
  @UseGuards(JwtAuthGuard)
  updateLandStatus(
    @Args('id', { type: () => String }) id: string,
    @Args('status', { type: () => String }) status: LandStatus,
  ) {
    return this.landService.updateStatus(id, status);
  }

  @Mutation(() => Land)
  @UseGuards(JwtAuthGuard)
  removeLand(@Args('id', { type: () => String }) id: string) {
    return this.landService.remove(id);
  }
}

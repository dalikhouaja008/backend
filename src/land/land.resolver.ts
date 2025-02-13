import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { LandService } from './land.service';
import { Land } from './schema/land.schema';
import { CreateLandInput } from './dto/create-land.input';
@Resolver(() => Land)
export class LandResolver {
  constructor(private readonly landService: LandService) {}

  @Mutation(() => Land)
  async createLand(@Args('createLandInput') createLandInput: CreateLandInput) {
    return this.landService.create(createLandInput);
  }

  @Query(() => [Land], { name: 'lands' })
  async findAll() {
    return this.landService.findAll();
  }

  @Query(() => Land, { name: 'land' })
  async findOne(@Args('id') id: string) {
    return this.landService.findOne(id);
  }

  @Mutation(() => Boolean)
  async deleteLand(@Args('id') id: string) {
    return this.landService.delete(id);
  }

  
}

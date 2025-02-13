import { Test, TestingModule } from '@nestjs/testing';
import { LandResolver } from './land.resolver';
import { LandService } from './land.service';

describe('LandResolver', () => {
  let resolver: LandResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LandResolver, LandService],
    }).compile();

    resolver = module.get<LandResolver>(LandResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

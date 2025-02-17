import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Land, LandSchema } from './schema/land.schema';
import { LandResolver } from './land.resolver';
import { LandService } from './land.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Land.name, schema: LandSchema }])],
  providers: [LandResolver, LandService],
  exports: [LandService],
})
export class LandModule {}

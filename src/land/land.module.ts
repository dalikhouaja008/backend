import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Land, LandSchema } from './schema/land.schema';
import { LandService } from './land.service';
import { LandResolver } from './land.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Land.name, schema: LandSchema }]) 
  ],
  providers: [LandService, LandResolver],
  exports: [LandService],
})
export class LandModule {}

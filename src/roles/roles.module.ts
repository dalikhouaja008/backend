import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesResolver } from './roles.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleSchema, RoleType } from './schemas/role.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RoleType.name, schema: RoleSchema }, // Enregistre RoleTypeModel
    ]),
  ],
  providers: [RolesService, RolesResolver],
  exports: [RolesService],
})
export class RolesModule {}

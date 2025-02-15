import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRoleDtoInput } from './dtos/role.dto';
import { RoleType } from './schemas/role.schema';

@Injectable()
export class RolesService {
  constructor(@InjectModel(RoleType.name) private RoleModel: Model<RoleType>) {}

  async createRole(role: CreateRoleDtoInput) {
    return this.RoleModel.create(role);
  }

  async getRoleById(roleId: string) {
    return this.RoleModel.findById(roleId);
  }
}

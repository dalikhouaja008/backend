import { SetMetadata } from '@nestjs/common';
import { PermissionInput } from 'src/roles/dtos/role.dto';

export const PERMISSIONS_KEY = 'permissions';

export const Permissions = (permissions: PermissionInput[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

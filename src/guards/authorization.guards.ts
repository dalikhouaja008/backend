import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { PERMISSIONS_KEY } from 'src/decorators/permissions.decorator';
import { PermissionInput } from 'src/roles/dtos/role.dto';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private reflector: Reflector, private authService: AuthenticationService) { }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.userId) {
      throw new UnauthorizedException('User Id not found');
    }

    const routePermissions: PermissionInput[] = this.reflector.getAllAndOverride(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    console.log(` the route permissions are ${routePermissions}`);

    if (!routePermissions) {
      return true;
    }

    try {
      const userPermissions = await this.authService.getUserPermissions(
        request.userId,
      );

      for (const routePermission of routePermissions) {
        const userPermission = userPermissions.find(
          (perm) => perm.resource === routePermission.resource,
        );

        if (!userPermission) {
          throw new ForbiddenException(`No permission found for resource: ${routePermission.resource}`);
        }

        const allActionsAvailable = routePermission.actions.every(
          (requiredAction) => userPermission.actions.includes(requiredAction),
        );

        if (!allActionsAvailable) {
          throw new ForbiddenException(
            `Missing required actions for resource ${routePermission.resource}. ` +
            `Required: ${routePermission.actions.join(', ')}. ` +
            `Available: ${userPermission.actions.join(', ')}`
          );
        }
      }
    } catch (e) {
      // Utiliser l'erreur capturée pour un message plus détaillé
      const errorMessage = e instanceof Error ? e.message : 'Unknown permission error';
      console.error(`Permission error: ${errorMessage}`);

      throw new ForbiddenException(
        `Access denied: ${errorMessage}`
      );
    }
    return true;
  }
}

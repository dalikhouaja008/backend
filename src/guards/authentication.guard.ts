import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AuthenticationGuard extends AuthGuard('jwt') {

  private readonly logger = new Logger(AuthenticationGuard.name);

  constructor(private readonly jwtService: JwtService) {
    super();
  } // Injectez ici le service JWT

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req; // Accédez à la requête via le contexte GraphQL
  }

  extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);
    if (!request) {
      throw new UnauthorizedException('Requête non valide');
    }
    
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('Token manquant');
    }
    
    try {
      // Vérifiez le token JWT ici
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'secret key', // Utilisez une variable d'environnement pour la clé secrète si possible
      });
      request.user = payload; // Ajoutez l'utilisateur à la requête
      
      return true;
    } catch (error) {
      this.logger.error(error); // Loggez les erreurs potentielles pour plus de visibilité sur les problèmes.
      throw new UnauthorizedException('Token invalide');
    }
  }
}

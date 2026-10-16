import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { USER_KEY } from './jwtAuth.guard';

/**
 * Como JwtAuthGuard, pero deja pasar sin token (p. ej. playlists públicas).
 * Si el token es válido, adjunta su payload a la solicitud.
 */
@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (type === 'Bearer' && token) {
      try {
        request[USER_KEY] = await this.jwtService.verifyAsync(token);
      } catch {
        // token vencido: se trata como visitante
      }
    }

    return true;
  }
}

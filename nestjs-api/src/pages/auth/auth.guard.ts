import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    const rbacToken = request.headers['X-Rbac-Token'];
    // console.log('RBAC TOKEN RECEIVED:', rbacToken);
    if (rbacToken) {
      request['rbacToken'] = rbacToken;
    }

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    // Get verification options
    const secret =
      this.configService.get<string>('JWT_SECRET') || 'defaultsecret';
    const issuer = this.configService.get<string>('JWT_ISSUER', 'nestjs-api');
    const audience = this.configService.get<string>(
      'JWT_AUDIENCE',
      'typescript-app',
    );

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret,
        issuer,
        audience,
      });
      request['user'] = payload;
    } catch (error: any) {
      // Log the error for debugging with more details
      console.error('Token verification error:', {
        message: error?.message,
        name: error?.name,
        secret: secret ? 'present' : 'missing',
        issuer,
        audience,
      });

      // Provide more specific error messages
      if (error?.message?.includes('expired')) {
        throw new UnauthorizedException('Token has expired');
      } else if (error?.message?.includes('audience')) {
        throw new UnauthorizedException('Invalid token audience');
      } else if (error?.message?.includes('issuer')) {
        throw new UnauthorizedException('Invalid token issuer');
      } else if (
        error?.message?.includes('secret') ||
        error?.message?.includes('signature')
      ) {
        throw new UnauthorizedException('Token signature verification failed');
      }

      throw new UnauthorizedException(
        `Invalid token: ${error?.message || 'Unknown error'}`,
      );
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

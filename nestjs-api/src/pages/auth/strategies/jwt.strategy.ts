import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'defaultsecret',
      issuer: 'nestjs-api',
      audience: 'typescript-app',
    });
  }

  async validate(payload: any) {
    // Additional validation could be performed here
    // For example, checking if the user still exists in the database
    // or if the user has been banned
    return {
      email: payload.email,
      role: payload.role,
    };
  }
}

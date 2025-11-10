import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/pages/users/user.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      clientID: configService.get<string>('OAUTH_CLIENT_ID'),
      clientSecret: configService.get<string>('OAUTH_CLIENT_SECRET'),
      callbackURL: configService.get<string>('OAUTH_CALLBACK_URL'),
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: Function,
  ): Promise<any> {
    // The user should already be authenticated (JWT/session)
    // The request object is available as this['request']
    const req: any = this['request'];
    const currentUser = req.user; // Set by JWT AuthGuard

    if (!currentUser) {
      // Not logged in, do not allow linking
      return done(
        new Error('You must be logged in to link GitHub account'),
        null,
      );
    }

    // Link GitHub account to the logged-in user
    const updated = await this.userService.update(currentUser.id, {
      githubId: profile.id,
      name: profile.displayName || profile.username,
    });

    return done(null, updated);
  }
}

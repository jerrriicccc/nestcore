import { AuthGuard } from '@nestjs/passport';
import { Req } from '@nestjs/common';
import { Response } from 'express';

import {
  Controller,
  HttpCode,
  Post,
  Get,
  Param,
  Body,
  Res,
  UseGuards,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from 'src/pages/auth/dto/login.dto';
import { CreateDto } from 'src/pages/users/dto/user.dto';
import { RateLimitGuard } from './rate-limit.guard';
import { UserEntity } from '../users/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomInt } from 'crypto';

@Controller('auth')
export class AuthController {
  public $clientID = process.env.OAUTH_CLIENT_ID;
  public $clientSecret = process.env.OAUTH_CLIENT_SECRET;
  public $urlCallback = process.env.OAUTH_CALLBACK_URL;

  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  // Passport-based GitHub OAuth endpoints (Best Practice)
  @Get('github')
  @UseGuards(AuthGuard('jwt'), AuthGuard('github'))
  async githubAuth() {
    // Passport handles redirect to GitHub
  }

  @Get('github/redirect')
  @UseGuards(AuthGuard('jwt'), AuthGuard('github'))
  async githubAuthRedirect(@Req() req, @Res() res: Response) {
    // req.user is set by Passport (from github.strategy.ts)
    // Generate JWT and redirect to frontend with token
    const jwt = await this.authService.generateJwt(req.user);
    // Use your actual frontend URL here
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
    return res.redirect(`${frontendUrl}/auth/github-link-success?token=${jwt}`);
  }

  @HttpCode(200)
  @Get('github/config')
  public githubConfig() {
    return {
      hasClientId: !!this.$clientID,
      hasClientSecret: !!this.$clientSecret,
      hasCallbackUrl: !!this.$urlCallback,
      clientIdLength: this.$clientID?.length || 0,
      callbackUrl: this.$urlCallback,
    };
  }

  @HttpCode(200)
  @Get('github/login')
  public async githubLoginInit() {
    try {
      // Check if GitHub OAuth is properly configured
      if (!this.$clientID || !this.$clientSecret || !this.$urlCallback) {
        return {
          status: 'error',
          message: 'GitHub OAuth is not properly configured',
          data: null,
        };
      }

      // Generate state parameter for security
      const state = randomInt(1000, 10000).toString();

      const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';

      // Construct GitHub OAuth URL
      const params = new URLSearchParams({
        client_id: this.$clientID,
        redirect_uri: this.$urlCallback,
        scope: 'user:email',
        state: state,
      });

      return {
        status: 'success',
        data: {
          access_uri: `${GITHUB_AUTH_URL}?${params.toString()}`,
          redirect_url: `${GITHUB_AUTH_URL}?${params.toString()}`,
          state: state,
        },
      };
    } catch (error) {
      this.logger.error('GitHub login initialization failed:', error.stack);
      return {
        status: 'error',
        message: 'Failed to initialize GitHub login',
        data: null,
      };
    }
  }

  @Post('requesttokenis')
  @HttpCode(200)
  async requesttokenis(
    @Body() body: { code: string; state?: string },
    @Res() res: Response,
  ) {
    try {
      if (!body.code) {
        return res.status(400).json({
          error: 'Invalid Request. Code parameter is required',
        });
      }

      // Validate state parameter (optional for security)
      let validatedEmail = null;
      if (body.state) {
        try {
          // Try to parse as base64-encoded JSON first
          const stateData = JSON.parse(
            Buffer.from(body.state, 'base64').toString(),
          );
          validatedEmail = stateData.email;

          // Check if state is not too old (5 minutes)
          const stateAge = Date.now() - stateData.timestamp;
          if (stateAge > 5 * 60 * 1000) {
            return res.status(400).json({
              error: 'Authentication session expired. Please try again.',
            });
          }
        } catch (stateError) {
          // If base64 parsing fails, treat it as a simple state token
          // Continue without email validation
        }
      }

      const tokenUrl = 'https://github.com/login/oauth/access_token';
      const clientId = this.$clientID;
      const clientSecret = this.$clientSecret;
      const redirectUri = this.$urlCallback;

      if (!clientId || !clientSecret || !redirectUri) {
        throw new BadRequestException(
          'Missing OAuth configuration (client ID, secret, or callback URL)',
        );
      }

      // Prepare the request payload
      const payload = {
        client_id: clientId,
        client_secret: clientSecret,
        code: body.code,
        redirect_uri: redirectUri,
      };

      // Make request to GitHub OAuth token endpoint
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (response.ok && responseData.access_token) {
        // Fetch user information from GitHub
        let userInfo: any = null;
        try {
          const userResponse = await fetch('https://api.github.com/user', {
            headers: {
              Authorization: `Bearer ${responseData.access_token}`,
              Accept: 'application/vnd.github.v3+json',
            },
          });

          if (userResponse.ok) {
            userInfo = await userResponse.json();
          }
        } catch (userError) {
          this.logger.warn('Failed to fetch user info from GitHub:', userError);
        }

        if (!userInfo) {
          return res.status(400).json({
            error: 'Failed to fetch user information from GitHub',
          });
        }

        // Find existing user based on a verified GitHub email
        let user;
        try {
          // Prefer email from profile; if missing, fetch verified emails
          let githubEmail: string | null = userInfo.email ?? null;

          if (!githubEmail) {
            try {
              const emailsResponse = await fetch(
                'https://api.github.com/user/emails',
                {
                  headers: {
                    Authorization: `Bearer ${responseData.access_token}`,
                    Accept: 'application/vnd.github.v3+json',
                    'User-Agent': 'nestjs-api',
                  },
                },
              );
              if (emailsResponse.ok) {
                const emails: Array<{
                  email: string;
                  verified: boolean;
                  primary: boolean;
                  visibility?: string | null;
                }> = await emailsResponse.json();

                const primaryVerified =
                  emails.find((e) => e.primary && e.verified) ||
                  emails.find((e) => e.verified);
                githubEmail = primaryVerified?.email ?? null;
              } else {
                this.logger.warn(
                  `Failed to fetch GitHub user emails: ${emailsResponse.status}`,
                );
              }
            } catch (emailsError) {
              this.logger.warn(
                'Error fetching GitHub user emails',
                emailsError,
              );
            }
          }

          // If we have a validated email from state, prefer that for lookup
          if (validatedEmail) {
            user = await this.findExistingUserByEmail(validatedEmail);

            // If we also resolved a GitHub email, ensure it matches the user's email
            if (
              user &&
              githubEmail &&
              githubEmail.toLowerCase() !== user.email.toLowerCase()
            ) {
              return res.status(401).json({
                error: 'Email mismatch',
                message:
                  'GitHub account email does not match the validated email.',
                details: {
                  githubEmail,
                  expectedEmail: user.email,
                },
              });
            }
          } else {
            // If no validated email, we must have a real email to proceed
            if (!githubEmail) {
              return res.status(401).json({
                error: 'Email unavailable',
                message:
                  'GitHub email is private or unavailable. Please make your email visible on GitHub or contact the administrator to link your account.',
              });
            }
            // Find or create user based on GitHub profile
            user = await this.authService.findOrCreateUserByGithub(
              userInfo,
              githubEmail,
            );
          }
        } catch (userError) {
          console.error('Error finding user:', userError);
          return res.status(400).json({
            error: 'Failed to authenticate user',
            details: userError.message,
          });
        }

        // Generate the same response structure as regular login
        let loginResponse;
        try {
          loginResponse = await this.authService.generateLoginResponse(user);

          // Augment response with GitHub OAuth tokens for authorization details
          loginResponse.data = {
            ...loginResponse.data,
            github_oauth: {
              access_token: responseData.access_token,
              scope: responseData.scope,
              token_type: responseData.token_type,
            },
          };
        } catch (loginError) {
          console.error('Error generating login response:', loginError);
          return res.status(500).json({
            error: 'Failed to generate login response',
            details: loginError.message,
          });
        }

        return res.status(200).json(loginResponse);
      } else {
        return res.status(400).json({
          error: 'Failed to exchange code for token',
          details: responseData,
          githubError: responseData.error_description || responseData.error,
        });
      }
    } catch (error) {
      this.logger.error('GitHub OAuth callback error:', error.stack);
      return res.status(500).json({
        error: 'Internal server error during OAuth callback',
      });
    }
  }

  @UseGuards(RateLimitGuard)
  @HttpCode(200)
  @Post('login')
  async login(@Body() { email, password }: LoginDto) {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    return this.authService.login(email.trim(), password.trim());
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { email: string; newPassword: string }) {
    return this.authService.resetPassword(body.email, body.newPassword);
  }

  @Get('verify/:token')
  async verify(@Param('token') token: string, @Res() res: Response) {
    try {
      const { redirectUrl } = await this.authService.verifyEmail(token);
      return res.redirect(redirectUrl);
    } catch (error) {
      return res.redirect('http://localhost:5000/auth/verify-failed');
    }
  }

  @Post('register')
  async register(@Body() createDto: CreateDto) {
    return this.authService.register(createDto);
  }

  /**
   * Find existing user by email
   * Only authenticates users that already exist in the database
   */
  private async findExistingUserByEmail(
    email: string,
  ): Promise<UserEntity | null> {
    return this.authService.findAndActivateUserByEmail(email);
  }

  /**
   * Customize the GitHub access token
   * This method can be extended to add custom logic like token validation,
   * additional claims, or integration with your own JWT system
   */
  private async customizeToken(githubToken: string): Promise<string> {
    try {
      return githubToken;
    } catch (error) {
      this.logger.error('Error customizing token:', error.stack);
      throw new BadRequestException('Failed to process token');
    }
  }
}

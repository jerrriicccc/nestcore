import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entity/user.entity';
import { CreateDto } from '../users/dto/user.dto';
import { randomUUID } from 'crypto';
import { MailService } from '../mail/mail.service';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(createDto: CreateDto): Promise<{ message: string }> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: createDto.email },
      });

      if (existingUser) {
        throw new BadRequestException('Email is already registered');
      }

      const user = this.userRepository.create({
        ...createDto,
        verificationtoken: randomUUID(),
        statusid: 1,
        failedloginattempts: 0,
        defaultroleid: 2,
      });

      await this.userRepository.save(user);

      await this.mailService.sendVerificationEmail(
        user.email,
        user.verificationtoken || '',
      );

      return {
        message:
          'User registered successfully. Please check your email to verify your account.',
      };
    } catch (error) {
      console.error('Error during registration:', error);
      throw new InternalServerErrorException('Failed to register user.');
    }
  }

  async verifyEmail(token: string) {
    const user = await this.userRepository.findOne({
      where: { verificationtoken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    user.verificationtoken = null;
    user.statusid = 2; // Set status to verified
    await this.userRepository.save(user);

    return {
      message: 'Email verified successfully. You can now login.',
      redirectUrl: 'http://localhost:5000/auth/verify-success',
    };
  }

  async login(email: string, password: string) {
    try {
      if (!email || !password) {
        throw new BadRequestException('Email and password are required');
      }

      const user = await this.userRepository.findOne({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          statusid: true,
          failedloginattempts: true,
          defaultroleid: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException(
          "Couldn't find your account. Please sign up.",
        );
      }
      if (user.statusid === 3) {
        throw new UnauthorizedException(
          'Account is locked. Please contact support.',
        );
      }
      if (user.statusid === 1) {
        throw new UnauthorizedException(
          'Please verify your email before logging in.',
        );
      }

      // Validate password
      const isPasswordValid = await argon2.verify(user.password, password);

      if (!isPasswordValid) {
        await this.userRepository.increment(
          { id: user.id },
          'failedloginattempts',
          1,
        );

        const updatedUser = await this.userRepository.findOne({
          where: { id: user.id },
          select: ['failedloginattempts', 'statusid'],
        });

        if (!updatedUser) {
          throw new UnauthorizedException('User not found');
        }

        if (updatedUser.failedloginattempts >= 5) {
          await this.userRepository.update(user.id, { statusid: 3 }); // Lock account
          throw new UnauthorizedException(
            'Too many failed attempts. Account has been locked.',
          );
        }

        throw new UnauthorizedException('Invalid Credentials');
      }

      await this.userRepository.update(user.id, { failedloginattempts: 0 });

      // Generate access token
      const accessToken = this.generateAccessToken(user);

      return {
        status: 'success',
        data: {
          access_token: accessToken,
          user: {
            id: user.id,
            email: user.email,
            defaultroleid: user.defaultroleid,
          },
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  private generateAccessToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      defaultroleid: user.defaultroleid,
      iat: Math.floor(Date.now() / 1000),
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>(
        'JWT_ACCESS_TOKEN_EXPIRATION',
        '24h',
      ),
      secret: this.configService.get<string>('JWT_SECRET'),
      issuer: this.configService.get<string>('JWT_ISSUER', 'nestjs-api'),
      audience: this.configService.get<string>(
        'JWT_AUDIENCE',
        'typescript-app',
      ),
    });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        statusid: true,
        defaultroleid: true,
      },
    });

    if (!user) {
      return null;
    }

    // Check if account is locked
    if (user.statusid === 3) {
      throw new UnauthorizedException(
        'Account is locked. Please contact support.',
      );
    }

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async getLoggedInByUser(req: Request): Promise<string | null> {
    const user = (req as any).user;
    return user?.email ?? null;
  }
}

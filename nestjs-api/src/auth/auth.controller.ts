import {
  Controller,
  HttpCode,
  HttpStatus,
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
import { LoginDto } from 'src/auth/dto/login.dto';
import { CreateDto } from 'src/users/dto/user.dto';
import { Response } from 'express';
import { RateLimitGuard } from './rate-limit.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entity/user.entity';
import * as argon2 from 'argon2';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      if (!loginDto.email || !loginDto.password) {
        throw new BadRequestException('Email and password are required');
      }

      const trimmedPassword = loginDto.password.trim();
      const result = await this.authService.login(
        loginDto.email,
        trimmedPassword,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Login failed for email: ${loginDto.email}`,
        error.stack,
      );
      throw error;
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { email: string; newPassword: string }) {
    const user = await this.userRepository.findOne({
      where: { email: body.email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const hashedPassword = await argon2.hash(body.newPassword);

    await this.userRepository.update(user.id, {
      password: hashedPassword,
      failedloginattempts: 0,
      statusid: 2,
    });

    return { message: 'Password reset successfully' };
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
}

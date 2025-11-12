import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/entity/user.entity';
import { ConfigService } from '@nestjs/config';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private rateLimitStore = new Map<string, RateLimitEntry>();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly configService: ConfigService,
  ) {
    this.maxAttempts = this.configService.get<number>(
      'RATE_LIMIT_MAX_ATTEMPTS',
      10,
    );
    this.windowMs = this.configService.get<number>(
      'RATE_LIMIT_WINDOW_MS',
      15 * 60 * 1000,
    ); // 15 minutes
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = this.getClientIp(request);
    const email = request.body?.email;

    // Check if user exists and is locked
    if (email) {
      const user = await this.userRepository.findOne({
        where: { email },
        select: ['statusid', 'failedloginattempts'],
      });

      if (user && user.statusid === 3) {
        throw new HttpException(
          'Account is locked. Please contact support.',
          HttpStatus.FORBIDDEN,
        );
      }
    }

    const key = `login_attempts:${ip}`;
    const attempts = await this.getLoginAttempts(key);

    if (attempts >= this.maxAttempts) {
      throw new HttpException(
        `Too many login attempts. Please try again in ${Math.ceil(this.windowMs / 60000)} minutes.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.incrementLoginAttempts(key);
    return true;
  }

  private getClientIp(request: any): string {
    return (
      request.ip ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.connection?.socket?.remoteAddress ||
      request.headers['x-forwarded-for']?.split(',')[0] ||
      'unknown'
    );
  }

  private async getLoginAttempts(key: string): Promise<number> {
    const entry = this.rateLimitStore.get(key);

    if (!entry) {
      return 0;
    }

    // Check if window has expired
    if (Date.now() > entry.resetTime) {
      this.rateLimitStore.delete(key);
      return 0;
    }

    return entry.count;
  }

  private async incrementLoginAttempts(key: string): Promise<void> {
    const currentEntry = this.rateLimitStore.get(key);
    const now = Date.now();

    if (!currentEntry || now > currentEntry.resetTime) {
      // Create new entry or reset expired entry
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      });
    } else {
      // Increment existing entry
      currentEntry.count++;
      this.rateLimitStore.set(key, currentEntry);
    }

    // Clean up old entries periodically
    this.cleanupExpiredEntries();
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        this.rateLimitStore.delete(key);
      }
    }
  }
}

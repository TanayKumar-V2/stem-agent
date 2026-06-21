import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto } from '@stem/shared';
import * as bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  async register(data: RegisterDto) {
    const user = await this.usersService.create(data);
    return this.generateTokens(user.id, user.email);
  }

  async login(data: LoginDto) {
    const user = await this.usersService.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id, user.email);
  }

  async refreshTokens(refreshToken: string) {
    const redis = this.redisService.getClient();
    const userId = await redis.get<string>(`refresh_token:${refreshToken}`);
    if (!userId) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Blacklist the old refresh token
    await redis.del(`refresh_token:${refreshToken}`);

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.generateTokens(user.id, user.email);
  }

  async logout(refreshToken: string) {
    if (refreshToken) {
      const redis = this.redisService.getClient();
      await redis.del(`refresh_token:${refreshToken}`);
    }
    return { success: true };
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m', // Short lived access token
    });

    const refreshToken = nanoid(64);
    
    // Store refresh token in Redis with 7 days expiration
    const redis = this.redisService.getClient();
    const ttlSeconds = 7 * 24 * 60 * 60;
    await redis.set(`refresh_token:${refreshToken}`, userId, { ex: ttlSeconds });

    return {
      accessToken,
      refreshToken,
    };
  }
}

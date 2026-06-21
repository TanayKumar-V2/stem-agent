import { Controller, Post, Body, Res, Req, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from '@stem/shared';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() data: RegisterDto, @Res({ passthrough: true }) res: FastifyReply) {
    const { accessToken, refreshToken } = await this.authService.register(data);
    this.setRefreshTokenCookie(res, refreshToken);
    return { accessToken };
  }

  @Public()
  @Post('login')
  async login(@Body() data: LoginDto, @Res({ passthrough: true }) res: FastifyReply) {
    const { accessToken, refreshToken } = await this.authService.login(data);
    this.setRefreshTokenCookie(res, refreshToken);
    return { accessToken };
  }

  @Public()
  @Post('refresh')
  async refreshTokens(@Req() req: FastifyRequest, @Res({ passthrough: true }) res: FastifyReply) {
    const refreshToken = req.cookies['refresh_token'];
    const { accessToken, refreshToken: newRefreshToken } = await this.authService.refreshTokens(refreshToken);
    this.setRefreshTokenCookie(res, newRefreshToken);
    return { accessToken };
  }

  @Post('logout')
  async logout(@Req() req: FastifyRequest, @Res({ passthrough: true }) res: FastifyReply) {
    const refreshToken = req.cookies['refresh_token'];
    await this.authService.logout(refreshToken);
    res.clearCookie('refresh_token');
    return { success: true };
  }

  @Get('me')
  async getMe(@Req() req: any) {
    return req.user;
  }

  private setRefreshTokenCookie(res: FastifyReply, token: string) {
    res.setCookie('refresh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/auth',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });
  }
}

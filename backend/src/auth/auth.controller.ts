import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: User) {
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }

  /** Kicks off the Google OAuth consent screen. */
  @UseGuards(AuthGuard('google'))
  @Get('google')
  googleAuth() {
    // Passport handles the redirect to Google; this body never runs.
  }

  /** Google redirects here after consent. We hand the JWT to the frontend via a query param. */
  @UseGuards(AuthGuard('google'))
  @Get('google/callback')
  googleCallback(@Req() req: Request & { user: { accessToken: string } }, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?token=${req.user.accessToken}`);
  }
}

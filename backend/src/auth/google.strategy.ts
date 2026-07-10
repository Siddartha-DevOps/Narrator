import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID ?? 'unconfigured',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? 'unconfigured',
      callbackURL: process.env.GOOGLE_CALLBACK_URL
        ?? 'http://localhost:4000/api/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      done(new Error('Google account has no verified email'), undefined);
      return;
    }

    const { accessToken } = await this.authService.loginWithGoogle({
      googleId: profile.id,
      email,
      fullName: profile.displayName,
    });

    done(null, { accessToken });
  }
}

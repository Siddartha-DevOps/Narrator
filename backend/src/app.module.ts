import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VideosModule } from './videos/videos.module';
import { BillingModule } from './billing/billing.module';
import { StorageModule } from './storage/storage.module';
import { RenderModule } from './render/render.module';
import { CreditsModule } from './credits/credits.module';
import { ModerationModule } from './moderation/moderation.module';
import { AiModule } from './ai/ai.module';
import { TeamsModule } from './teams/teams.module';
import { AdminModule } from './admin/admin.module';
import { HealthController } from './health/health.controller';
import { User } from './users/user.entity';
import { VideoJob } from './videos/video-job.entity';
import { Subscription } from './billing/subscription.entity';
import { CreditTransaction } from './credits/credit-transaction.entity';
import { Team } from './teams/team.entity';
import { TeamMember } from './teams/team-member.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [User, VideoJob, Subscription, CreditTransaction, Team, TeamMember],
      synchronize: process.env.NODE_ENV !== 'production',
      autoLoadEntities: true,
    }),
    AuthModule,
    UsersModule,
    VideosModule,
    BillingModule,
    StorageModule,
    RenderModule,
    CreditsModule,
    ModerationModule,
    AiModule,
    TeamsModule,
    AdminModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}

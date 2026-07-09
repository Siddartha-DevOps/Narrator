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
import { HealthController } from './health/health.controller';
import { User } from './users/user.entity';
import { VideoJob } from './videos/video-job.entity';
import { Subscription } from './billing/subscription.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [User, VideoJob, Subscription],
      synchronize: process.env.NODE_ENV !== 'production',
      autoLoadEntities: true,
    }),
    AuthModule,
    UsersModule,
    VideosModule,
    BillingModule,
    StorageModule,
    RenderModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}

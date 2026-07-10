import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { VideoJob } from '../videos/video-job.entity';
import { Subscription } from '../billing/subscription.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, VideoJob, Subscription])],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}

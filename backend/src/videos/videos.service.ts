import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { VideoJob } from './video-job.entity';
import { CreateVideoJobDto } from './dto/create-video-job.dto';
import { VIDEO_QUEUE } from './queue/video-queue.provider';
import { User } from '../users/user.entity';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(VideoJob)
    private readonly videoJobsRepo: Repository<VideoJob>,
    @Inject(VIDEO_QUEUE)
    private readonly videoQueue: Queue,
  ) {}

  async createJob(user: User, dto: CreateVideoJobDto): Promise<VideoJob> {
    const job = await this.videoJobsRepo.save(
      this.videoJobsRepo.create({
        userId: user.id,
        script: dto.script,
        avatarId: dto.avatarId ?? 'default',
        voiceId: dto.voiceId ?? 'en-US-female-1',
        resolution: dto.resolution ?? '1280x720',
        status: 'queued',
      }),
    );

    await this.videoQueue.add(
      'render',
      { videoJobId: job.id },
      { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
    );

    return job;
  }

  async listForUser(userId: string): Promise<VideoJob[]> {
    return this.videoJobsRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneForUser(userId: string, id: string): Promise<VideoJob> {
    const job = await this.videoJobsRepo.findOne({ where: { id, userId } });
    if (!job) {
      throw new NotFoundException('Video job not found');
    }
    return job;
  }
}

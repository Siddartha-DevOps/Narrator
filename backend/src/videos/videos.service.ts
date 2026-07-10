import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { VideoJob } from './video-job.entity';
import { CreateVideoJobDto } from './dto/create-video-job.dto';
import { VIDEO_QUEUE } from './queue/video-queue.provider';
import { User } from '../users/user.entity';
import { CreditsService } from '../credits/credits.service';
import { ModerationService } from '../moderation/moderation.service';
import {
  PLANS,
  estimateCreditCost,
  estimateScriptDurationSeconds,
  resolutionExceedsPlan,
  RESOLUTION_LABELS,
} from '../config/plans.config';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(VideoJob)
    private readonly videoJobsRepo: Repository<VideoJob>,
    @Inject(VIDEO_QUEUE)
    private readonly videoQueue: Queue,
    private readonly creditsService: CreditsService,
    private readonly moderationService: ModerationService,
  ) {}

  async createJob(user: User, dto: CreateVideoJobDto): Promise<VideoJob> {
    this.moderationService.assertScriptAllowed(dto.script);

    const plan = PLANS[user.planTier];
    const resolution = dto.resolution ?? '1280x720';
    if (resolutionExceedsPlan(resolution, plan)) {
      throw new BadRequestException(
        `Your ${plan.name} plan supports up to ${plan.maxResolution}. Upgrade to render at ${RESOLUTION_LABELS[resolution]}.`,
      );
    }

    const estimatedDuration = estimateScriptDurationSeconds(dto.script);
    const creditCost = estimateCreditCost(estimatedDuration, RESOLUTION_LABELS[resolution] ?? '720p');

    const job = await this.videoJobsRepo.save(
      this.videoJobsRepo.create({
        userId: user.id,
        script: dto.script,
        avatarId: dto.avatarId ?? 'default',
        voiceId: dto.voiceId ?? 'en-US-female-1',
        resolution,
        status: 'queued',
        creditCost,
        watermarked: plan.watermark,
      }),
    );

    try {
      await this.creditsService.debit(
        user.id,
        creditCost,
        job.id,
        `Video render (${RESOLUTION_LABELS[resolution]}, ~${estimatedDuration}s)`,
      );
    } catch (err) {
      await this.videoJobsRepo.remove(job);
      throw err;
    }

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

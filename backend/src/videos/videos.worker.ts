import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { Repository } from 'typeorm';
import { AppModule } from '../app.module';
import { VideoJob } from './video-job.entity';
import { VIDEO_QUEUE_NAME } from './queue/video-queue.provider';
import { FfmpegService } from '../render/ffmpeg.service';
import { S3Service } from '../storage/s3.service';
import { renderNarrationAudio, fetchAvatarClip } from './avatar-provider.stub';

/**
 * Standalone BullMQ worker process. Run separately from the HTTP API
 * (`npm run worker`) so rendering load never blocks request handling.
 * Deployed as its own Render "Background Worker" service in production.
 */
async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const videoJobsRepo = appContext.get<Repository<VideoJob>>(
    getRepositoryToken(VideoJob),
  );
  const ffmpegService = appContext.get(FfmpegService);
  const s3Service = appContext.get(S3Service);

  const connection = new IORedis(
    process.env.REDIS_URL ?? 'redis://localhost:6379',
    { maxRetriesPerRequest: null },
  );

  const worker = new Worker(
    VIDEO_QUEUE_NAME,
    async (job: Job<{ videoJobId: string }>) => {
      const videoJob = await videoJobsRepo.findOne({
        where: { id: job.data.videoJobId },
      });
      if (!videoJob) return;

      videoJob.status = 'processing';
      await videoJobsRepo.save(videoJob);

      try {
        const avatarClipPath = await fetchAvatarClip(videoJob.avatarId);
        const narrationAudioPath = await renderNarrationAudio(
          videoJob.script,
          videoJob.voiceId,
        );

        const outputPath = await ffmpegService.renderVideo({
          avatarClipPath,
          narrationAudioPath,
          resolution: videoJob.resolution as '1280x720' | '1920x1080' | '3840x2160',
        });

        const key = `renders/${videoJob.userId}/${videoJob.id}.mp4`;
        const outputUrl = await s3Service.uploadFile(key, outputPath, 'video/mp4');

        videoJob.status = 'completed';
        videoJob.outputUrl = outputUrl;
        videoJob.progress = 100;
      } catch (err) {
        videoJob.status = 'failed';
        videoJob.errorMessage = err instanceof Error ? err.message : 'Unknown error';
      }

      await videoJobsRepo.save(videoJob);
    },
    { connection, concurrency: Number(process.env.WORKER_CONCURRENCY ?? 2) },
  );

  worker.on('failed', (job, err) => {
    // eslint-disable-next-line no-console
    console.error(`Video render job ${job?.id} failed:`, err);
  });

  // eslint-disable-next-line no-console
  console.log('Narrator video render worker started');
}

bootstrap();

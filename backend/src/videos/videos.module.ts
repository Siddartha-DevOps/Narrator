import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoJob } from './video-job.entity';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { videoQueueProvider } from './queue/video-queue.provider';
import { StorageModule } from '../storage/storage.module';
import { RenderModule } from '../render/render.module';

@Module({
  imports: [TypeOrmModule.forFeature([VideoJob]), StorageModule, RenderModule],
  providers: [VideosService, videoQueueProvider],
  controllers: [VideosController],
  exports: [VideosService],
})
export class VideosModule {}

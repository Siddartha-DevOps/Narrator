import { Module } from '@nestjs/common';
import { TtsService } from './tts.service';
import { LipSyncService } from './lipsync.service';
import { AiController } from './ai.controller';

@Module({
  providers: [TtsService, LipSyncService],
  controllers: [AiController],
  exports: [TtsService, LipSyncService],
})
export class AiModule {}

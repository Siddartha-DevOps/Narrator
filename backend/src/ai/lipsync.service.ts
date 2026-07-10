import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';

export interface LipSyncResult {
  avatarClipPath: string;
}

/**
 * Wraps a third-party avatar/lip-sync provider (e.g. HeyGen-style avatar
 * API, D-ID, SadTalker, or an in-house model) that produces a talking-head
 * clip for the chosen avatar. Configure via AVATAR_PROVIDER_BASE_URL /
 * AVATAR_PROVIDER_API_KEY — same credentials as TtsService since most
 * vendors bundle both under one account.
 *
 * MVP stub returns a bundled avatar loop so the render pipeline (FFmpeg
 * compositing) is exercisable without a live vendor contract. Swap
 * `generate()`'s body for a real call; FfmpegService only needs a local
 * file path back.
 */
@Injectable()
export class LipSyncService {
  private readonly logger = new Logger(LipSyncService.name);

  async generate(avatarId: string, audioPath: string): Promise<LipSyncResult> {
    this.logger.debug(`Generating lip-synced clip for avatar "${avatarId}"`);

    if (process.env.AVATAR_PROVIDER_BASE_URL && process.env.AVATAR_PROVIDER_API_KEY) {
      return this.callProvider(avatarId, audioPath);
    }

    return {
      avatarClipPath: path.join(__dirname, '..', '..', 'assets', 'avatars', `${avatarId}.mp4`),
    };
  }

  private async callProvider(avatarId: string, audioPath: string): Promise<LipSyncResult> {
    const response = await fetch(`${process.env.AVATAR_PROVIDER_BASE_URL}/v1/lipsync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.AVATAR_PROVIDER_API_KEY}`,
      },
      body: JSON.stringify({ avatarId, audioPath }),
    });

    if (!response.ok) {
      throw new Error(`Lip-sync provider error: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as LipSyncResult;
  }
}

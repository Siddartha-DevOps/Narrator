import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import { findVoice } from './voices.catalog';

export interface TtsResult {
  audioPath: string;
  durationSeconds: number;
}

/**
 * Wraps a third-party text-to-speech provider (e.g. ElevenLabs, Azure
 * Speech, Google Cloud TTS, or an in-house model). Configure via
 * AVATAR_PROVIDER_BASE_URL / AVATAR_PROVIDER_API_KEY.
 *
 * The MVP implementation below is a stub that returns a bundled silent
 * track so the render pipeline is exercisable end-to-end without a live
 * vendor contract. Swap `synthesize()`'s body for a real HTTP call —
 * the return shape (local file path + duration) is what the render
 * worker expects, so no other code needs to change.
 */
@Injectable()
export class TtsService {
  private readonly logger = new Logger(TtsService.name);

  async synthesize(script: string, voiceId: string): Promise<TtsResult> {
    const voice = findVoice(voiceId);
    this.logger.debug(
      `Synthesizing ${script.length} chars with voice "${voice.label}" (${voice.languageCode})`,
    );

    if (process.env.AVATAR_PROVIDER_BASE_URL && process.env.AVATAR_PROVIDER_API_KEY) {
      return this.callProvider(script, voice.id);
    }

    // Local fallback for development without provider credentials.
    return {
      audioPath: path.join(__dirname, '..', '..', 'assets', 'silence.wav'),
      durationSeconds: Math.max(3, Math.round(script.split(/\s+/).length / 2.5)),
    };
  }

  private async callProvider(script: string, voiceId: string): Promise<TtsResult> {
    const response = await fetch(`${process.env.AVATAR_PROVIDER_BASE_URL}/v1/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.AVATAR_PROVIDER_API_KEY}`,
      },
      body: JSON.stringify({ text: script, voiceId }),
    });

    if (!response.ok) {
      throw new Error(`TTS provider error: ${response.status} ${response.statusText}`);
    }

    const { audioPath, durationSeconds } = (await response.json()) as TtsResult;
    return { audioPath, durationSeconds };
  }
}

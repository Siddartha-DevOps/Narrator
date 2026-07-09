import * as path from 'path';

/**
 * Placeholder integration point for a pluggable avatar/TTS provider
 * (e.g. an internal model, or a third-party API keyed by AVATAR_PROVIDER_*
 * env vars). Swap these two functions for real HTTP calls without touching
 * the render pipeline or queue plumbing.
 */

export async function fetchAvatarClip(avatarId: string): Promise<string> {
  return path.join(__dirname, '..', '..', 'assets', 'avatars', `${avatarId}.mp4`);
}

export async function renderNarrationAudio(
  script: string,
  voiceId: string,
): Promise<string> {
  void script;
  void voiceId;
  return path.join(__dirname, '..', '..', 'assets', 'silence.wav');
}

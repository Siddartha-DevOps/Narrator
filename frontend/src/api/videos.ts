import { apiClient } from './client';

export interface VideoJob {
  id: string;
  script: string;
  avatarId: string;
  voiceId: string;
  resolution: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  outputUrl?: string;
  progress: number;
  creditCost: number;
  watermarked: boolean;
  errorMessage?: string;
  createdAt: string;
}

export interface CreateVideoJobPayload {
  script: string;
  avatarId?: string;
  voiceId?: string;
  resolution?: string;
}

export async function createVideoJob(payload: CreateVideoJobPayload): Promise<VideoJob> {
  const { data } = await apiClient.post<VideoJob>('/videos', payload);
  return data;
}

export async function listVideoJobs(): Promise<VideoJob[]> {
  const { data } = await apiClient.get<VideoJob[]>('/videos');
  return data;
}

export async function getVideoJob(id: string): Promise<VideoJob> {
  const { data } = await apiClient.get<VideoJob>(`/videos/${id}`);
  return data;
}

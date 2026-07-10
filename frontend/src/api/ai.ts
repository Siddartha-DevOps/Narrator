import { apiClient } from './client';

export interface Voice {
  id: string;
  label: string;
  languageCode: string;
  languageName: string;
  gender: 'female' | 'male';
  regional: boolean;
}

export interface Avatar {
  id: string;
  name: string;
  thumbnailUrl: string;
  style: string;
}

export async function listVoices(): Promise<Voice[]> {
  const { data } = await apiClient.get<Voice[]>('/ai/voices');
  return data;
}

export async function listAvatars(): Promise<Avatar[]> {
  const { data } = await apiClient.get<Avatar[]>('/ai/avatars');
  return data;
}

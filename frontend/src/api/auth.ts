import { apiClient } from './client';

export interface AuthResponse {
  accessToken: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  fullName?: string;
  planTier: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password });
  return data;
}

export async function register(
  email: string,
  password: string,
  fullName?: string,
): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', {
    email,
    password,
    fullName,
  });
  return data;
}

export async function fetchCurrentUser(): Promise<CurrentUser> {
  const { data } = await apiClient.get<CurrentUser>('/auth/me');
  return data;
}

import { apiClient } from './client';

export interface Team {
  id: string;
  name: string;
  ownerId: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: 'owner' | 'member';
}

export async function getMyTeam(): Promise<{ team: Team; members: TeamMember[] } | null> {
  const { data } = await apiClient.get('/teams/mine');
  return data;
}

export async function createTeam(name: string): Promise<Team> {
  const { data } = await apiClient.post<Team>('/teams', { name });
  return data;
}

export async function inviteMember(teamId: string, email: string): Promise<TeamMember> {
  const { data } = await apiClient.post<TeamMember>(`/teams/${teamId}/members`, { email });
  return data;
}

export async function removeMember(teamId: string, userId: string): Promise<void> {
  await apiClient.delete(`/teams/${teamId}/members/${userId}`);
}

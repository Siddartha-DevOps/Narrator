import { apiClient } from './client';

export interface CreditTransaction {
  id: string;
  type: 'grant' | 'debit' | 'refund' | 'adjustment';
  amount: number;
  videoJobId?: string;
  reason?: string;
  createdAt: string;
}

export async function getCreditBalance(): Promise<number> {
  const { data } = await apiClient.get<{ balance: number }>('/credits/balance');
  return data.balance;
}

export async function getCreditHistory(): Promise<CreditTransaction[]> {
  const { data } = await apiClient.get<CreditTransaction[]>('/credits/history');
  return data;
}

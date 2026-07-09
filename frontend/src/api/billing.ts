import { apiClient } from './client';

export type PlanTier = 'starter' | 'pro' | 'business';

export async function createCheckoutSession(planTier: PlanTier): Promise<{ url: string }> {
  const { data } = await apiClient.post('/billing/checkout-session', { planTier });
  return data;
}

export async function createPortalSession(): Promise<{ url: string }> {
  const { data } = await apiClient.post('/billing/portal-session');
  return data;
}

import { apiClient } from './client';

// Enterprise is sales-assisted, not a self-serve Stripe Checkout tier.
export type CheckoutPlanTier = 'starter' | 'pro';

export interface PlanInfo {
  tier: 'free' | 'starter' | 'pro' | 'enterprise';
  name: string;
  priceLabel: string;
  credits: string;
  resolution: string;
  seats: string;
  regionalVoices: boolean;
  features: string[];
}

export const PLAN_CATALOG: PlanInfo[] = [
  {
    tier: 'free',
    name: 'Free',
    priceLabel: '₹0',
    credits: '20',
    resolution: '720p',
    seats: '1 seat',
    regionalVoices: false,
    features: ['Watermarked exports', 'English voices only'],
  },
  {
    tier: 'starter',
    name: 'Starter',
    priceLabel: '₹500/mo',
    credits: '150',
    resolution: '1080p',
    seats: '1 seat',
    regionalVoices: true,
    features: ['No watermark', 'Hindi, Telugu & Tamil voices'],
  },
  {
    tier: 'pro',
    name: 'Pro',
    priceLabel: '₹1,500/mo',
    credits: '600',
    resolution: '1080p',
    seats: '5 seats',
    regionalVoices: true,
    features: ['No watermark', 'All regional voices', 'Team accounts'],
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    priceLabel: 'Contact sales',
    credits: '5,000+',
    resolution: '4K',
    seats: '50+ seats',
    regionalVoices: true,
    features: ['Custom credit pools', 'Dedicated support', 'SSO on request'],
  },
];

export async function createCheckoutSession(planTier: CheckoutPlanTier): Promise<{ url: string }> {
  const { data } = await apiClient.post('/billing/checkout-session', { planTier });
  return data;
}

export async function createPortalSession(): Promise<{ url: string }> {
  const { data } = await apiClient.post('/billing/portal-session');
  return data;
}

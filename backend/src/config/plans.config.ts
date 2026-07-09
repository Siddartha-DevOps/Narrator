export type PlanTier = 'free' | 'starter' | 'pro' | 'business';

export interface PlanDefinition {
  tier: PlanTier;
  name: string;
  stripePriceEnv?: string;
  monthlyRenderMinutes: number;
  maxResolution: '720p' | '1080p' | '4k';
  price: number;
}

export const PLANS: Record<PlanTier, PlanDefinition> = {
  free: {
    tier: 'free',
    name: 'Free',
    monthlyRenderMinutes: 3,
    maxResolution: '720p',
    price: 0,
  },
  starter: {
    tier: 'starter',
    name: 'Starter',
    stripePriceEnv: 'STRIPE_PRICE_STARTER',
    monthlyRenderMinutes: 30,
    maxResolution: '1080p',
    price: 29,
  },
  pro: {
    tier: 'pro',
    name: 'Pro',
    stripePriceEnv: 'STRIPE_PRICE_PRO',
    monthlyRenderMinutes: 120,
    maxResolution: '1080p',
    price: 99,
  },
  business: {
    tier: 'business',
    name: 'Business',
    stripePriceEnv: 'STRIPE_PRICE_BUSINESS',
    monthlyRenderMinutes: 600,
    maxResolution: '4k',
    price: 299,
  },
};

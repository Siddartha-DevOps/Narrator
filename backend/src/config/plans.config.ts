export type PlanTier = 'free' | 'starter' | 'pro' | 'enterprise';

export interface PlanDefinition {
  tier: PlanTier;
  name: string;
  /** Env var holding the Stripe Price ID for this tier. Omitted for Enterprise (sales-assisted). */
  stripePriceEnv?: string;
  /** Price in INR (minor unit: whole rupees), shown on the pricing page. */
  priceInr: number;
  /** Credits granted at the start of each billing cycle. 1 credit ~= 10s of rendered 720p video. */
  monthlyCredits: number;
  maxResolution: '720p' | '1080p' | '4k';
  /** Free/trial tiers get a visible watermark burned into the output. */
  watermark: boolean;
  /** Seats included for team accounts. Solo tiers are capped at 1. */
  teamSeats: number;
  regionalVoices: boolean;
}

export const PLANS: Record<PlanTier, PlanDefinition> = {
  free: {
    tier: 'free',
    name: 'Free',
    priceInr: 0,
    monthlyCredits: 20,
    maxResolution: '720p',
    watermark: true,
    teamSeats: 1,
    regionalVoices: false,
  },
  starter: {
    tier: 'starter',
    name: 'Starter',
    stripePriceEnv: 'STRIPE_PRICE_STARTER',
    priceInr: 500,
    monthlyCredits: 150,
    maxResolution: '1080p',
    watermark: false,
    teamSeats: 1,
    regionalVoices: true,
  },
  pro: {
    tier: 'pro',
    name: 'Pro',
    stripePriceEnv: 'STRIPE_PRICE_PRO',
    priceInr: 1500,
    monthlyCredits: 600,
    maxResolution: '1080p',
    watermark: false,
    teamSeats: 5,
    regionalVoices: true,
  },
  enterprise: {
    tier: 'enterprise',
    name: 'Enterprise',
    // No self-serve Stripe price: enterprise deals are sales-assisted and
    // provisioned manually (custom credit pool + seat count).
    priceInr: 0,
    monthlyCredits: 5000,
    maxResolution: '4k',
    watermark: false,
    teamSeats: 50,
    regionalVoices: true,
  },
};

/** Credits consumed per second of rendered output, by resolution. */
export const CREDIT_COST_PER_SECOND: Record<PlanDefinition['maxResolution'], number> = {
  '720p': 0.1,
  '1080p': 0.2,
  '4k': 0.5,
};

export function estimateCreditCost(durationSeconds: number, resolution: PlanDefinition['maxResolution']): number {
  return Math.max(1, Math.ceil(durationSeconds * CREDIT_COST_PER_SECOND[resolution]));
}

export const RESOLUTION_LABELS: Record<string, PlanDefinition['maxResolution']> = {
  '1280x720': '720p',
  '1920x1080': '1080p',
  '3840x2160': '4k',
};

const RESOLUTION_RANK: Record<PlanDefinition['maxResolution'], number> = {
  '720p': 0,
  '1080p': 1,
  '4k': 2,
};

export function resolutionExceedsPlan(
  resolution: string,
  plan: PlanDefinition,
): boolean {
  const label = RESOLUTION_LABELS[resolution] ?? '720p';
  return RESOLUTION_RANK[label] > RESOLUTION_RANK[plan.maxResolution];
}

/** Rough words-per-minute for narrated speech, used to estimate render duration before TTS runs. */
export const AVERAGE_SPEAKING_WORDS_PER_MINUTE = 150;

export function estimateScriptDurationSeconds(script: string): number {
  const wordCount = script.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.round((wordCount / AVERAGE_SPEAKING_WORDS_PER_MINUTE) * 60));
}

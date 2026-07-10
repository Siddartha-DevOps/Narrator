import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { PlanCard } from '../components/PlanCard';
import { useAuth } from '../context/AuthContext';
import { createCheckoutSession, CheckoutPlanTier, PlanInfo, PLAN_CATALOG } from '../api/billing';

export function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleSelect = async (tier: PlanInfo['tier']) => {
    if (!user) {
      navigate('/signup');
      return;
    }
    if (tier === 'free') return;
    if (tier === 'enterprise') {
      window.location.href = 'mailto:sales@narrator.app?subject=Enterprise%20plan';
      return;
    }

    setLoadingTier(tier);
    try {
      const { url } = await createCheckoutSession(tier as CheckoutPlanTier);
      window.location.href = url;
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Simple, credit-based pricing</h1>
            <p className="mx-auto mt-3 max-w-xl text-gray-600">
              Every plan includes lip-synced avatar rendering. Upgrade for higher resolution,
              regional voices, and team seats.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PLAN_CATALOG.map((plan) => (
              <PlanCard
                key={plan.tier}
                name={plan.name}
                priceLabel={plan.priceLabel}
                credits={plan.credits}
                resolution={plan.resolution}
                seats={plan.seats}
                features={plan.features}
                highlighted={plan.tier === 'pro'}
                current={user?.planTier === plan.tier}
                ctaDisabled={loadingTier === plan.tier}
                ctaLabel={
                  loadingTier === plan.tier
                    ? 'Redirecting…'
                    : plan.tier === 'enterprise'
                      ? 'Contact sales'
                      : plan.tier === 'free'
                        ? 'Start for free'
                        : 'Subscribe'
                }
                onSelect={() => handleSelect(plan.tier)}
              />
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            1 credit ≈ 10 seconds of rendered 720p video. Higher resolutions cost more credits
            per second. Unused credits do not roll over.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}

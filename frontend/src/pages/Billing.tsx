import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { PlanCard } from '../components/PlanCard';
import { useAuth } from '../context/AuthContext';
import {
  createCheckoutSession,
  createPortalSession,
  CheckoutPlanTier,
  PlanInfo,
  PLAN_CATALOG,
} from '../api/billing';

export function Billing() {
  const { user } = useAuth();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const subscribe = async (tier: PlanInfo['tier']) => {
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

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const { url } = await createPortalSession();
      window.location.href = url;
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="mt-1 text-gray-600">
          Current plan: <strong className="text-gray-900">{user?.planTier}</strong>
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                    : 'Subscribe'
              }
              onSelect={() => subscribe(plan.tier)}
            />
          ))}
        </div>

        <button type="button" className="btn-secondary mt-8" onClick={openPortal} disabled={portalLoading}>
          {portalLoading ? 'Opening…' : 'Manage billing / invoices'}
        </button>
      </main>
    </div>
  );
}

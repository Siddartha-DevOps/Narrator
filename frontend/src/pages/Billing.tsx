import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { createCheckoutSession, createPortalSession, PlanTier } from '../api/billing';

const PLAN_CARDS: { tier: PlanTier; name: string; price: string; minutes: string }[] = [
  { tier: 'starter', name: 'Starter', price: '$29/mo', minutes: '30 render minutes' },
  { tier: 'pro', name: 'Pro', price: '$99/mo', minutes: '120 render minutes' },
  { tier: 'business', name: 'Business', price: '$299/mo', minutes: '600 render minutes' },
];

export function Billing() {
  const { user } = useAuth();
  const [loadingTier, setLoadingTier] = useState<PlanTier | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const subscribe = async (tier: PlanTier) => {
    setLoadingTier(tier);
    try {
      const { url } = await createCheckoutSession(tier);
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
    <div className="dashboard">
      <Navbar />
      <main className="billing-page">
        <h1>Billing</h1>
        <p>Current plan: <strong>{user?.planTier}</strong></p>

        <div className="plan-cards">
          {PLAN_CARDS.map((plan) => (
            <div key={plan.tier} className="plan-card">
              <h3>{plan.name}</h3>
              <p className="plan-price">{plan.price}</p>
              <p>{plan.minutes}</p>
              <button
                type="button"
                disabled={loadingTier === plan.tier || user?.planTier === plan.tier}
                onClick={() => subscribe(plan.tier)}
              >
                {user?.planTier === plan.tier
                  ? 'Current plan'
                  : loadingTier === plan.tier
                    ? 'Redirecting…'
                    : 'Subscribe'}
              </button>
            </div>
          ))}
        </div>

        <button type="button" onClick={openPortal} disabled={portalLoading}>
          {portalLoading ? 'Opening…' : 'Manage billing / invoices'}
        </button>
      </main>
    </div>
  );
}

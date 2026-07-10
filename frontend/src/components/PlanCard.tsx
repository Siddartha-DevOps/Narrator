interface Props {
  name: string;
  priceLabel: string;
  credits: string;
  resolution: string;
  seats: string;
  highlighted?: boolean;
  current?: boolean;
  ctaLabel: string;
  ctaDisabled?: boolean;
  onSelect: () => void;
  features: string[];
}

export function PlanCard({
  name,
  priceLabel,
  credits,
  resolution,
  seats,
  highlighted,
  current,
  ctaLabel,
  ctaDisabled,
  onSelect,
  features,
}: Props) {
  return (
    <div
      className={`card flex flex-col ${
        highlighted ? 'border-brand-500 ring-2 ring-brand-500' : ''
      }`}
    >
      {highlighted && (
        <span className="badge mb-3 w-fit bg-brand-500 text-white">Most popular</span>
      )}
      <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
      <p className="mt-2 text-3xl font-bold text-gray-900">{priceLabel}</p>

      <ul className="mt-4 space-y-1.5 text-sm text-gray-600">
        <li>{credits} credits / month</li>
        <li>Up to {resolution}</li>
        <li>{seats}</li>
        {features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>

      <button
        type="button"
        className={`mt-6 ${current ? 'btn-secondary' : 'btn-primary'}`}
        disabled={ctaDisabled}
        onClick={onSelect}
      >
        {current ? 'Current plan' : ctaLabel}
      </button>
    </div>
  );
}

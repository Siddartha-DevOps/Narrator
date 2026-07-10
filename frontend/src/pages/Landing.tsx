import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

const FEATURES = [
  {
    title: 'Text-to-video in minutes',
    body: 'Paste a script, pick an avatar and voice, and Narrator renders a talking-head video — no editor, no timeline.',
  },
  {
    title: 'Regional language voices',
    body: 'Native Hindi, Telugu, and Tamil voices alongside English, so your content reaches the audience that actually watches it.',
  },
  {
    title: 'Credit-based pricing',
    body: 'Pay for what you render. Credits roll up automatically by resolution — no confusing per-minute math.',
  },
  {
    title: 'Team accounts',
    body: 'Enterprise plans include shared seats so your whole content team can generate videos from one workspace.',
  },
];

const COMPARISON = [
  { feature: 'Starting price', narrator: '₹500/mo', others: '$24–89/mo' },
  { feature: 'Hindi / Telugu / Tamil voices', narrator: true, others: false },
  { feature: 'Credit-based usage', narrator: true, others: 'Minute caps' },
  { feature: 'Team seats on mid-tier plan', narrator: true, others: 'Enterprise only' },
];

export function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 pb-20 pt-16 text-center sm:px-6 lg:px-8">
          <span className="badge bg-brand-50 text-brand-700">Alternative to HeyGen · Pictory · Synthesia</span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Turn a script into an AI avatar video — in your language.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Narrator generates talking-head videos from text with lip-synced avatars and
            natural voices, including Hindi, Telugu, and Tamil. Built for creators, marketers,
            and teams who need video without a production budget.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/signup" className="btn-primary px-6 py-3 text-base">
              Start for free
            </Link>
            <Link to="/pricing" className="btn-secondary px-6 py-3 text-base">
              See pricing
            </Link>
          </div>
          <p className="mt-3 text-sm text-gray-400">No credit card required · 20 free credits on signup</p>
        </section>

        <section className="border-y border-gray-200 bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f) => (
                <div key={f.title} className="card">
                  <h3 className="text-base font-semibold text-gray-900">{f.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-gray-900">How Narrator compares</h2>
          <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Feature</th>
                  <th className="px-4 py-3 font-medium text-brand-600">Narrator</th>
                  <th className="px-4 py-3 font-medium">HeyGen / Synthesia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {COMPARISON.map((row) => (
                  <tr key={row.feature}>
                    <td className="px-4 py-3 text-gray-700">{row.feature}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {typeof row.narrator === 'boolean' ? (row.narrator ? '✓' : '—') : row.narrator}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {typeof row.others === 'boolean' ? (row.others ? '✓' : '—') : row.others}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-brand-500 py-16">
          <div className="mx-auto max-w-3xl px-4 text-center text-white sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold">Ready to generate your first video?</h2>
            <p className="mt-2 text-brand-100">Sign up free and get 20 credits — enough for your first few videos.</p>
            <Link to="/signup" className="btn mt-6 bg-white text-brand-600 hover:bg-brand-50">
              Create your account
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

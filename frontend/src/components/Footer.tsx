import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-sm text-white">
                N
              </span>
              Narrator
            </div>
            <p className="mt-3 max-w-xs text-sm text-gray-500">
              AI avatar video generation for creators, marketers, and teams — with Hindi,
              Telugu, and Tamil voices built in.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900">Product</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li><Link to="/pricing" className="hover:text-gray-900">Pricing</Link></li>
              <li><Link to="/signup" className="hover:text-gray-900">Get started</Link></li>
              <li><Link to="/login" className="hover:text-gray-900">Log in</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li><a href="mailto:support@narrator.app" className="hover:text-gray-900">Contact sales</a></li>
              <li><a href="#" className="hover:text-gray-900">Privacy policy</a></li>
              <li><a href="#" className="hover:text-gray-900">Terms of service</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900">Compliance</h4>
            <p className="mt-3 text-sm text-gray-500">
              All videos generated with Narrator are watermarked or disclosed as AI-generated
              per our content policy.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-100 pt-6 text-sm text-gray-400">
          © {new Date().getFullYear()} Narrator. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

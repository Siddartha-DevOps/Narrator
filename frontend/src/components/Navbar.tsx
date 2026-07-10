import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const appLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/editor', label: 'New video' },
  { to: '/billing', label: 'Billing' },
  { to: '/profile', label: 'Profile' },
];

const marketingLinks = [
  { to: '/pricing', label: 'Pricing' },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = user ? appLinks : marketingLinks;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">N</span>
          Narrator
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-brand-600' : 'text-gray-600 hover:text-gray-900'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="badge bg-brand-50 text-brand-700">{user.planTier} plan</span>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">
                Log in
              </Link>
              <Link to="/signup" className="btn-primary">
                Get started free
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-gray-200 px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-3">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-gray-700"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            {user ? (
              <button
                type="button"
                className="btn-secondary w-full"
                onClick={() => {
                  logout();
                  navigate('/login');
                  setMobileOpen(false);
                }}
              >
                Log out
              </button>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link to="/login" className="btn-secondary w-full" onClick={() => setMobileOpen(false)}>
                  Log in
                </Link>
                <Link to="/signup" className="btn-primary w-full" onClick={() => setMobileOpen(false)}>
                  Get started free
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

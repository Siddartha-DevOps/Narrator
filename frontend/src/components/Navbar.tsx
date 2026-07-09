import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <Link to="/dashboard" className="navbar-brand">
        Narrator
      </Link>
      <nav className="navbar-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/billing">Billing</Link>
      </nav>
      <div className="navbar-user">
        {user && <span className="navbar-plan">{user.planTier} plan</span>}
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          Log out
        </button>
      </div>
    </header>
  );
}

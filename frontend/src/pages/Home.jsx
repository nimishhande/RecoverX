import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Wallet, CreditCard, Activity } from 'lucide-react';

const Home = () => {
  const { logout } = useAuth();

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="dashboard-nav-logo">RecoverX</div>
        <button onClick={logout} className="btn-logout">
          <LogOut size={16} /> Logout
        </button>
      </nav>

      <div className="dashboard-grid">
        <div className="dashboard-card animate-in">
          <div className="dashboard-card-header">
            <Wallet size={22} color="var(--primary)" />
            <span className="badge-green">+12.5%</span>
          </div>
          <h2>$42,500.00</h2>
          <p>Total Balance</p>
        </div>

        <div className="dashboard-card animate-in" style={{ animationDelay: '0.1s' }}>
          <div className="dashboard-card-header">
            <CreditCard size={22} color="var(--primary)" />
            <span className="badge-muted">Active</span>
          </div>
          <h2>Visa •••• 4242</h2>
          <p>Main Card</p>
        </div>

        <div className="dashboard-card animate-in" style={{ animationDelay: '0.2s' }}>
          <div className="dashboard-card-header">
            <Activity size={22} color="#f59e0b" />
            <span className="badge-muted">Last 24h</span>
          </div>
          <h2>12 Transactions</h2>
          <p>Recent Activity</p>
        </div>
      </div>
    </div>
  );
};

export default Home;

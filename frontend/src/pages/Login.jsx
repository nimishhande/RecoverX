import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, KeyRound, Shield } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-form-section">
        <div className="auth-card animate-in">
          <div className="auth-logo">RecoverX</div>
          <h1 className="auth-title">Sign in to your account</h1>
          <p className="auth-subtitle">Welcome back! Please enter your details.</p>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label">Email</label>
              </div>
              <input
                type="email"
                className="form-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label">Password</label>
                <a href="#" className="form-link">Forgot your password?</a>
              </div>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-checkbox-row">
              <input
                type="checkbox"
                id="remember"
                className="form-checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label htmlFor="remember" className="form-checkbox-label">
                Remember me on this device
              </label>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="divider">
            <span className="divider-line"></span>
            <span className="divider-text">Or sign in with</span>
            <span className="divider-line"></span>
          </div>

          <div className="social-buttons">
            <button type="button" className="btn-social">
              <svg width="16" height="16" viewBox="0 0 16 16"><path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8V6.558h7.545z" fill="#4285F4"/></svg>
              Google
            </button>
            <button type="button" className="btn-social">
              <KeyRound size={16} />
              Passkey
            </button>
            <button type="button" className="btn-social">
              <Shield size={16} />
              SSO
            </button>
          </div>

          <div className="auth-footer">
            New to RecoverX? <Link to="/register">Create account</Link>
          </div>
        </div>
      </div>

      <div className="auth-gradient-section" />
    </div>
  );
};

export default Login;

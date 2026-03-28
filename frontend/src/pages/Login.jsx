import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Fingerprint, Shield, Eye, EyeOff, Zap, TrendingUp } from 'lucide-react';
import GridPattern from '../components/GridPattern';
import RepelParticles from '../components/RepelParticles';
import FloatingOrbs from '../components/FloatingOrbs';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);

  // Staggered animation
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await login(email, password);
    if (res.success) {
      // Voice Greeting Feature (AI voice)
      const utterance = new SpeechSynthesisUtterance(`Welcome back, Sanchita. Initializing your profit intelligence engine.`);
      utterance.rate = 0.95; 
      utterance.pitch = 1.05;
      
      // Voice matching logic runs asynchronously in some browsers, but we set a default
      const voices = window.speechSynthesis.getVoices();
      const bestVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Female') || v.name.includes('Zira')));
      if (bestVoice) utterance.voice = bestVoice;

      window.speechSynthesis.speak(utterance);

      navigate('/');
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="rx-auth-page">
      {/* Left panel - Interactive background */}
      <div className="rx-auth-visual">
        <FloatingOrbs />
        <div className="rx-grid-layer">
          <GridPattern cellSize={35} dotRadius={1} glowRadius={160} />
        </div>
        <div className="rx-particles-layer">
          <RepelParticles particleSpacing={30} repelRadius={100} />
        </div>
        
        {/* Branding overlay */}
        <div className="rx-visual-content">
          <div className={`rx-visual-badge ${visible ? 'rx-visible' : ''}`}>
            <TrendingUp size={14} />
            <span>AI-Powered Profit Intelligence</span>
          </div>
          <h2 className={`rx-visual-title ${visible ? 'rx-visible' : ''}`}>
            Maximize Your
            <br />
            Freelance <span className="rx-gradient-text">Profits</span>
            <br />
            with Intelligence
          </h2>
          <p className={`rx-visual-desc ${visible ? 'rx-visible' : ''}`}>
            Smart profit tracking, expense analysis, and revenue forecasting 
            built for freelancers & solopreneurs.
          </p>

          {/* Floating stat cards */}
          <div className={`rx-floating-cards ${visible ? 'rx-visible' : ''}`}>
            <div className="rx-stat-card rx-stat-1">
              <div className="rx-stat-value">$64,573<span className="rx-stat-decimal">.00</span></div>
              <div className="rx-stat-label">Net Profit This Year</div>
              <div className="rx-stat-change positive">+12.5%</div>
            </div>
            <div className="rx-stat-card rx-stat-2">
              <div className="rx-stat-value">$5,340<span className="rx-stat-decimal">.00</span></div>
              <div className="rx-stat-label">Revenue This Month</div>
              <div className="rx-stat-change positive">+8.2%</div>
            </div>
          </div>

          {/* Partner logos */}
          <div className={`rx-partners ${visible ? 'rx-visible' : ''}`}>
            <span className="rx-partners-label">Integrated with your favorite tools</span>
            <div className="rx-partners-row">
              {['Upwork', 'Fiverr', 'Stripe', 'PayPal'].map((name) => (
                <div key={name} className="rx-partner-logo">
                  <div className="rx-partner-dot" />
                  {name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="rx-auth-form-panel">
        <div className="rx-auth-form-inner">
          <div ref={formRef} className={`rx-auth-card ${visible ? 'rx-visible' : ''}`}>
            {/* Logo */}
            <div className="rx-logo-row">
              <div className="rx-logo">
                <div className="rx-logo-icon">
                  <TrendingUp size={20} />
                </div>
                <span className="rx-logo-text">ProfitLens</span>
              </div>
            </div>

            <h1 className="rx-auth-title">Welcome back</h1>
            <p className="rx-auth-subtitle">Sign in to your profit dashboard</p>

            {error && (
              <div className="rx-error-banner">
                <div className="rx-error-icon">!</div>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="rx-form">
              <div className={`rx-input-group ${focusedField === 'email' ? 'focused' : ''} ${email ? 'has-value' : ''}`}>
                <label className="rx-label">Email address</label>
                <div className="rx-input-wrapper">
                  <Mail size={18} className="rx-input-icon" />
                  <input
                    id="login-email"
                    type="email"
                    className="rx-input"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                </div>
              </div>

              <div className={`rx-input-group ${focusedField === 'password' ? 'focused' : ''} ${password ? 'has-value' : ''}`}>
                <div className="rx-label-row">
                  <label className="rx-label">Password</label>
                  <a href="#" className="rx-forgot-link">Forgot?</a>
                </div>
                <div className="rx-input-wrapper">
                  <Lock size={18} className="rx-input-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className="rx-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                  <button
                    type="button"
                    className="rx-toggle-pass"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="rx-checkbox-row">
                <label className="rx-checkbox-label" htmlFor="remember-me">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="rx-checkbox"
                  />
                  <span className="rx-checkbox-custom" />
                  <span>Keep me signed in</span>
                </label>
              </div>

              <button
                id="login-submit"
                type="submit"
                className={`rx-btn-primary ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <div className="rx-spinner" />
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="rx-divider">
              <div className="rx-divider-line" />
              <span>or continue with</span>
              <div className="rx-divider-line" />
            </div>

            <div className="rx-social-row">
              <button type="button" className="rx-btn-social" id="login-google">
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                </svg>
                Google
              </button>
              <button type="button" className="rx-btn-social" id="login-passkey">
                <Fingerprint size={18} />
                Passkey
              </button>
              <button type="button" className="rx-btn-social" id="login-sso">
                <Shield size={18} />
                SSO
              </button>
            </div>

            <div className="rx-auth-footer">
              New to ProfitLens? <Link to="/register" className="rx-link">Create an account</Link>
            </div>
            <div className="rx-powered-by">
              Powered by <span className="rx-powered-brand">RecoverX</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

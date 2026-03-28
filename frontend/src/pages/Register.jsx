import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Zap, Check, X, TrendingUp } from 'lucide-react';
import GridPattern from '../components/GridPattern';
import RepelParticles from '../components/RepelParticles';
import FloatingOrbs from '../components/FloatingOrbs';

const Register = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    role: 'USER'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Password strength
  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };
  const strengthScore = Object.values(passwordChecks).filter(Boolean).length;

  // Staggered animation
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await register(formData);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  const getStrengthColor = () => {
    if (strengthScore <= 1) return '#ef4444';
    if (strengthScore <= 2) return '#f59e0b';
    if (strengthScore <= 3) return '#00cc6a';
    return '#00ff88';
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
            <span>Smart Profit Intelligence</span>
          </div>
          <h2 className={`rx-visual-title ${visible ? 'rx-visible' : ''}`}>
            Take Control of
            <br />
            Your <span className="rx-gradient-text">Freelance</span>
            <br />
            Profits Today
          </h2>
          <p className={`rx-visual-desc ${visible ? 'rx-visible' : ''}`}>
            Join thousands of freelancers tracking profits, optimizing expenses, 
            and growing their business with AI-driven insights.
          </p>

          {/* Feature cards */}
          <div className={`rx-feature-cards ${visible ? 'rx-visible' : ''}`}>
            <div className="rx-feature-card">
              <div className="rx-feature-icon">📊</div>
              <div>
                <div className="rx-feature-title">Profit Analytics</div>
                <div className="rx-feature-desc">Real-time income & expense tracking</div>
              </div>
            </div>
            <div className="rx-feature-card">
              <div className="rx-feature-icon">🤖</div>
              <div>
                <div className="rx-feature-title">AI Forecasting</div>
                <div className="rx-feature-desc">Predict monthly revenue trends</div>
              </div>
            </div>
            <div className="rx-feature-card">
              <div className="rx-feature-icon">💰</div>
              <div>
                <div className="rx-feature-title">Tax-ready Reports</div>
                <div className="rx-feature-desc">Auto-generated P&L statements</div>
              </div>
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

      {/* Right panel - Register form */}
      <div className="rx-auth-form-panel">
        <div className="rx-auth-form-inner">
          <div className={`rx-auth-card ${visible ? 'rx-visible' : ''}`}>
            {/* Logo */}
            <div className="rx-logo-row">
              <div className="rx-logo">
                <div className="rx-logo-icon">
                  <TrendingUp size={20} />
                </div>
                <span className="rx-logo-text">ProfitLens</span>
              </div>
            </div>

            <h1 className="rx-auth-title">Create your account</h1>
            <p className="rx-auth-subtitle">Start tracking your freelance profits in seconds</p>

            {error && (
              <div className="rx-error-banner">
                <div className="rx-error-icon">!</div>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="rx-form">
              <div className="rx-name-row">
                <div className={`rx-input-group ${focusedField === 'firstname' ? 'focused' : ''} ${formData.firstname ? 'has-value' : ''}`}>
                  <label className="rx-label">First name</label>
                  <div className="rx-input-wrapper">
                    <User size={18} className="rx-input-icon" />
                    <input
                      id="register-firstname"
                      type="text"
                      name="firstname"
                      className="rx-input"
                      placeholder="John"
                      value={formData.firstname}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('firstname')}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                  </div>
                </div>
                <div className={`rx-input-group ${focusedField === 'lastname' ? 'focused' : ''} ${formData.lastname ? 'has-value' : ''}`}>
                  <label className="rx-label">Last name</label>
                  <div className="rx-input-wrapper">
                    <User size={18} className="rx-input-icon" />
                    <input
                      id="register-lastname"
                      type="text"
                      name="lastname"
                      className="rx-input"
                      placeholder="Doe"
                      value={formData.lastname}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('lastname')}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className={`rx-input-group ${focusedField === 'email' ? 'focused' : ''} ${formData.email ? 'has-value' : ''}`}>
                <label className="rx-label">Email address</label>
                <div className="rx-input-wrapper">
                  <Mail size={18} className="rx-input-icon" />
                  <input
                    id="register-email"
                    type="email"
                    name="email"
                    className="rx-input"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                </div>
              </div>

              <div className={`rx-input-group ${focusedField === 'password' ? 'focused' : ''} ${formData.password ? 'has-value' : ''}`}>
                <label className="rx-label">Password</label>
                <div className="rx-input-wrapper">
                  <Lock size={18} className="rx-input-icon" />
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="rx-input"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
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

                {/* Password strength */}
                {formData.password && (
                  <div className="rx-password-strength">
                    <div className="rx-strength-bar">
                      <div
                        className="rx-strength-fill"
                        style={{ width: `${(strengthScore / 4) * 100}%`, background: getStrengthColor() }}
                      />
                    </div>
                    <div className="rx-strength-checks">
                      {Object.entries(passwordChecks).map(([key, passed]) => (
                        <div key={key} className={`rx-check-item ${passed ? 'passed' : ''}`}>
                          {passed ? <Check size={12} /> : <X size={12} />}
                          <span>
                            {key === 'length' && '8+ chars'}
                            {key === 'uppercase' && 'Uppercase'}
                            {key === 'number' && 'Number'}
                            {key === 'special' && 'Special'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="rx-checkbox-row">
                <label className="rx-checkbox-label" htmlFor="agree-terms">
                  <input
                    type="checkbox"
                    id="agree-terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="rx-checkbox"
                  />
                  <span className="rx-checkbox-custom" />
                  <span>
                    I agree to the <a href="#" className="rx-link-inline">Terms</a> & <a href="#" className="rx-link-inline">Privacy Policy</a>
                  </span>
                </label>
              </div>

              <button
                id="register-submit"
                type="submit"
                className={`rx-btn-primary ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <div className="rx-spinner" />
                ) : (
                  <>
                    Create account
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="rx-auth-footer">
              Already have an account? <Link to="/login" className="rx-link">Sign in</Link>
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

export default Register;

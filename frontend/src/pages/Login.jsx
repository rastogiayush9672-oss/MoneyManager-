import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, Zap } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('madhav@test.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleInstantLogin = async () => {
    try {
      setLoading(true);
      await login('madhav@test.com', '123456');
      toast.success('Welcome back, Madhav! Logged in successfully.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Login failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const emailToUse = email.trim() || 'madhav@test.com';
      const passwordToUse = password || '123456';
      await login(emailToUse, passwordToUse);
      toast.success('Authenticated successfully!');
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        toast.error('Unable to reach server. Please ensure port 5000 is listening.');
      } else {
        toast.error(err.response?.data?.msg || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail = 'madhav@test.com') => {
    setEmail(demoEmail);
    setPassword('123456');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-app)',
        padding: '1.5rem'
      }}
    >
      <div
        className="card shadow-lg p-4 p-md-5"
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)'
        }}
      >
        {/* Brand */}
        <div className="text-center mb-4">
          <div
            className="mx-auto mb-3"
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1.5rem',
              boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)'
            }}
          >
            ₹
          </div>
          <h3 className="fw-bold mb-1">Welcome Back</h3>
          <p className="text-muted small">Sign in to your MoneyManager AI Enterprise portal</p>
        </div>

        {/* Demo Fast Access Box */}
        <div
          className="p-3 rounded-3 mb-4"
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            fontSize: '0.85rem'
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="fw-bold d-flex align-items-center gap-1 text-primary">
              <Sparkles size={16} /> Verified Demo Credentials
            </div>
            <button
              type="button"
              onClick={handleInstantLogin}
              disabled={loading}
              className="btn btn-sm btn-primary d-flex align-items-center gap-1 shadow-sm"
              style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem', fontWeight: 600 }}
            >
              <Zap size={14} /> 1-Click Login
            </button>
          </div>

          <div className="d-flex flex-column gap-1 text-muted small">
            <div>
              <strong className="text-body">Email:</strong> <code style={{ color: '#2563eb', fontWeight: 600 }}>madhav@test.com</code>
            </div>
            <div>
              <strong className="text-body">Password:</strong> <code style={{ color: '#16a34a', fontWeight: 700 }}>123456</code>
            </div>
          </div>

          <div className="mt-2 pt-2 border-top d-flex gap-2 align-items-center">
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>Other users:</span>
            <button
              type="button"
              onClick={() => fillDemo('rastogiayush9672@gmail.com')}
              className="btn btn-link p-0 text-decoration-none"
              style={{ fontSize: '0.75rem' }}
            >
              Ayush
            </button>
            <span className="text-muted">•</span>
            <button
              type="button"
              onClick={() => fillDemo('prince@test.com')}
              className="btn btn-link p-0 text-decoration-none"
              style={{ fontSize: '0.75rem' }}
            >
              Prince
            </button>
            <span className="text-muted">•</span>
            <button
              type="button"
              onClick={() => fillDemo('sonu@test.com')}
              className="btn btn-link p-0 text-decoration-none"
              style={{ fontSize: '0.75rem' }}
            >
              Sonu
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email Address</label>
            <div className="input-group">
              <span className="input-group-text border-0" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                <Mail size={16} />
              </span>
              <input
                type="email"
                className="form-control"
                placeholder="madhav@test.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label fw-semibold mb-0">Password</label>
              <span
                style={{ cursor: 'pointer', fontSize: '0.78rem', color: 'var(--color-primary)' }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </span>
            </div>
            <div className="input-group">
              <span className="input-group-text border-0" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="123456"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-text text-muted" style={{ fontSize: '0.75rem' }}>
              Standard password for all accounts is: <strong className="text-success">123456</strong>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-100 py-3 fw-bold mb-3 d-flex align-items-center justify-content-center gap-2"
            style={{ borderRadius: 'var(--radius-md)', fontSize: '1rem' }}
          >
            {loading ? 'Authenticating...' : <><span>Sign In</span> <ArrowRight size={18} /></>}
          </button>

          <p className="text-center text-muted small mb-0">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary fw-bold">
              Register here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;

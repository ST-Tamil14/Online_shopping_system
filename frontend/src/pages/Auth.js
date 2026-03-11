import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ email: 'admin@shopwave.com', password: 'Admin@123456' });
    else setForm({ email: 'demo@shopwave.com', password: 'demo123456' });
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, background: 'var(--ink)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>S</span>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--ink)' }}>ShopWave</span>
          </Link>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: 'var(--muted)' }}>Sign in to your account to continue</p>
        </div>

        {/* Demo buttons */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button onClick={() => fillDemo('customer')} className="btn btn-outline btn-sm" style={{ flex: 1, fontSize: 12 }}>Demo Customer</button>
          <button onClick={() => fillDemo('admin')} className="btn btn-outline btn-sm" style={{ flex: 1, fontSize: 12 }}>Demo Admin</button>
        </div>

        <div style={{ background: 'white', borderRadius: 20, padding: 32, boxShadow: 'var(--shadow)' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: 'var(--error)' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="form-control" placeholder="you@example.com" required autoComplete="email" />
            </div>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ margin: 0 }}>Password</label>
                <Link to="#" style={{ fontSize: 13, color: 'var(--accent)' }}>Forgot password?</Link>
              </div>
              <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="form-control" placeholder="••••••••" required autoComplete="current-password" />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-full btn-lg" style={{ marginTop: 8 }}>
              {loading ? '⏳ Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form.name, form.email, form.password, form.phone);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, background: 'var(--ink)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>S</span>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--ink)' }}>ShopWave</span>
          </Link>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Create account</h1>
          <p style={{ color: 'var(--muted)' }}>Join thousands of happy shoppers</p>
        </div>

        <div style={{ background: 'white', borderRadius: 20, padding: 32, boxShadow: 'var(--shadow)' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: 'var(--error)' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', required: true },
              { key: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com', required: true },
              { key: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '+1 (555) 000-0000', required: false },
              { key: 'password', label: 'Password', type: 'password', placeholder: 'Min 6 characters', required: true },
            ].map(({ key, label, type, placeholder, required }) => (
              <div className="form-group" key={key}>
                <label>{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} className="form-control" placeholder={placeholder} required={required} />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn btn-primary btn-full btn-lg" style={{ marginTop: 8 }}>
              {loading ? '⏳ Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--muted)' }}>
            By creating an account, you agree to our{' '}
            <Link to="#" style={{ color: 'var(--accent)' }}>Terms</Link> and{' '}
            <Link to="#" style={{ color: 'var(--accent)' }}>Privacy Policy</Link>
          </p>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: 'var(--muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

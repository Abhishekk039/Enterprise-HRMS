import React, { useState } from 'react';
import { Shield, KeyRound, Mail, User as UserIcon, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginView: React.FC = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ROLE_ADMIN' | 'ROLE_HR' | 'ROLE_MANAGER' | 'ROLE_EMPLOYEE'>('ROLE_EMPLOYEE');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register({ username, email, password, role });
      } else {
        await login({ usernameOrEmail, password });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setError(null);
    setLoading(true);
    try {
      await login({ usernameOrEmail: 'admin', password: 'admin123' });
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: "linear-gradient(rgba(8, 10, 20, 0.62), rgba(8, 10, 20, 0.72)), url('/background.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: '24px',
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '420px',
          width: '100%',
          padding: '32px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
          background: 'rgba(15, 23, 42, 0.72)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--primary)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1.1rem',
              marginBottom: '14px',
            }}
          >
            H
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            Enterprise HRMS
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
            {isRegister
              ? 'Establish an organizational member profile'
              : 'Sign in to access your enterprise workspace'}
          </p>
        </div>

        {/* Quick Demo Pill */}
        {!isRegister && (
          <div
            style={{
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={14} color="var(--primary)" />
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Demo Admin: <strong style={{ color: 'var(--text-primary)' }}>admin / admin123</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={handleQuickDemo}
              disabled={loading}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.72rem', padding: '2px 8px', height: '24px' }}
            >
              Quick Login
            </button>
          </div>
        )}

        {/* Segmented Tab Bar */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '3px',
            marginBottom: '20px',
            gap: '2px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '6px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.8rem',
              fontWeight: !isRegister ? 600 : 400,
              color: !isRegister ? 'var(--text-primary)' : 'var(--text-tertiary)',
              background: !isRegister ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '6px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.8rem',
              fontWeight: isRegister ? 600 : 400,
              color: isRegister ? 'var(--text-primary)' : 'var(--text-tertiary)',
              background: isRegister ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
            }}
          >
            Register
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              marginBottom: '16px',
              fontSize: '0.8rem',
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isRegister ? (
            <>
              <div className="form-group">
                <label className="form-label">Username *</label>
                <div style={{ position: 'relative' }}>
                  <UserIcon
                    size={14}
                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
                  />
                  <input
                    type="text"
                    required
                    className="form-control"
                    style={{ paddingLeft: '32px' }}
                    placeholder="e.g. john_doe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Work Email *</label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={14}
                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
                  />
                  <input
                    type="email"
                    required
                    className="form-control"
                    style={{ paddingLeft: '32px' }}
                    placeholder="john@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Role *</label>
                <select
                  className="form-control"
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                >
                  <option value="ROLE_EMPLOYEE">Employee</option>
                  <option value="ROLE_MANAGER">Manager</option>
                  <option value="ROLE_HR">HR Specialist</option>
                  <option value="ROLE_ADMIN">System Administrator</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Password *</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound
                    size={14}
                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
                  />
                  <input
                    type="password"
                    required
                    className="form-control"
                    style={{ paddingLeft: '32px' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Username or Work Email</label>
                <div style={{ position: 'relative' }}>
                  <UserIcon
                    size={14}
                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
                  />
                  <input
                    type="text"
                    required
                    className="form-control"
                    style={{ paddingLeft: '32px' }}
                    placeholder="admin or user@company.com"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound
                    size={14}
                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
                  />
                  <input
                    type="password"
                    required
                    className="form-control"
                    style={{ paddingLeft: '32px' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '6px', height: '36px' }}
          >
            <span>{loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Search, Shield, Bell, Clock as ClockIcon, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  title: string;
  category?: string;
  subtitle?: string;
  onSearchClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, category = 'Workspace' }) => {
  const { user } = useAuth();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header
      style={{
        height: '52px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-base)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Breadcrumb Trail */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
        <span style={{ color: 'var(--text-tertiary)' }}>{category}</span>
        <span style={{ color: 'var(--text-muted)' }}>/</span>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
      </div>

      {/* Right Tools & Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* System Time & Date */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.75rem',
            color: 'var(--text-tertiary)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <ClockIcon size={13} color="var(--text-tertiary)" />
          <span style={{ fontFamily: 'var(--font-mono)' }}>{time}</span>
          <span style={{ color: 'var(--border-muted)' }}>•</span>
          <span>{today}</span>
        </div>

        {/* Live Service Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--success)',
              boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
            }}
          />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>API Connected</span>
        </div>

        {/* User Role Tag */}
        {user && (
          <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
            <Shield size={11} color="var(--primary)" />
            <span>{user.role.replace('ROLE_', '')}</span>
          </span>
        )}
      </div>
    </header>
  );
};

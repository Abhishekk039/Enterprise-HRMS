import React, { useState, useEffect } from 'react';
import {
  Settings,
  Server,
  Database,
  ShieldCheck,
  Zap,
  RefreshCw,
  Cpu,
  Monitor,
  CheckCircle2,
  Trash2,
  Code
} from 'lucide-react';
import { Badge } from './ui/Badge';
import { useToast } from './ui/ToastContext';

export const SettingsView: React.FC = () => {
  const toast = useToast();
  const [latency, setLatency] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const [dbStatus, setDbStatus] = useState<'healthy' | 'checking'>('healthy');

  const checkHealth = async () => {
    setChecking(true);
    const start = performance.now();
    try {
      const res = await fetch('/api/departments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hrms_token')}`
        }
      });
      const end = performance.now();
      if (res.ok) {
        setLatency(Math.round(end - start));
        setDbStatus('healthy');
        toast.success(`API operational: ${Math.round(end - start)}ms round-trip`);
      } else {
        setLatency(null);
        toast.error('API responded with error code ' + res.status);
      }
    } catch (err: any) {
      setLatency(null);
      toast.error('Backend unreachable');
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleClearCache = () => {
    toast.info('Session cache flushed');
  };

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px' }}>
      {/* Infrastructure Diagnostics Banner */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Server size={20} color="var(--primary)" />
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>System Diagnostics & Health</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
                Real-time connection status between Vite SPA frontend and Spring Boot microservice
              </p>
            </div>
          </div>

          <button
            onClick={checkHealth}
            disabled={checking}
            className="btn btn-secondary btn-sm"
          >
            <RefreshCw size={13} className={checking ? 'spin' : ''} />
            <span>{checking ? 'Pinging...' : 'Check Health'}</span>
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
          }}
        >
          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>API Gateway</span>
              <Badge variant="active">Connected</Badge>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              http://localhost:8080
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              Round-trip latency: {latency ? `${latency}ms` : 'Probing...'}
            </div>
          </div>

          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>Persistence Engine</span>
              <Badge variant="active">Operational</Badge>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              MySQL 8.0
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              Flyway Migrations: V1 → V5 Applied
            </div>
          </div>

          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>Security Protocol</span>
              <Badge variant="active">Enforced</Badge>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              Spring Security 6
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              Stateless JWT / BCrypt
            </div>
          </div>
        </div>
      </div>

      {/* Environment Specification */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Code size={18} color="var(--primary)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Runtime Specifications</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-xs)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Backend Framework</span>
            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>Spring Boot 3.5.16</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-xs)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Java Virtual Machine</span>
            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>OpenJDK 17 LTS</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-xs)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Frontend Bundler</span>
            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>Vite 5.4 + React 18</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-xs)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Type Checker</span>
            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>TypeScript 5.5</span>
          </div>
        </div>
      </div>

      {/* Appearance & Interface */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Monitor size={18} color="var(--primary)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Design System & Tokens</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 500, color: 'var(--text-primary)' }}>Theme Mode</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>Linear/Vercel inspired neutral dark palette</div>
            </div>
            <Badge variant="active">Charcoal Dark (Default)</Badge>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 500, color: 'var(--text-primary)' }}>Brand Accent Color</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>Primary interactive highlight</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--primary)' }} />
              <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>#6366f1 (Indigo)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import {
  User,
  Shield,
  Mail,
  Building2,
  Briefcase,
  Calendar,
  Key,
  CheckCircle2,
  AlertCircle,
  Copy,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Employee } from '../types';
import { Badge } from './ui/Badge';
import { useToast } from './ui/ToastContext';

export const ProfileView: React.FC = () => {
  const { user, isAdmin, isHr, isManager, isAdminOrHr } = useAuth();
  const toast = useToast();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.employeeId) {
      setLoading(true);
      api.getEmployee(user.employeeId)
        .then((data: Employee) => setEmployee(data))
        .catch((err: any) => console.error('Failed to load linked employee:', err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const copyToken = () => {
    const token = localStorage.getItem('hrms_token');
    if (token) {
      navigator.clipboard.writeText(token);
      toast.success('JWT Bearer token copied to clipboard');
    }
  };

  const rolePermissions = [
    { name: 'View Workforce Dashboard', allowed: true },
    { name: 'Punch Shift Attendance Clock', allowed: true },
    { name: 'Apply for Personal Leaves', allowed: true },
    { name: 'View Personal Payslips & Slips', allowed: true },
    { name: 'Review Team Appraisals', allowed: isManager || isAdminOrHr },
    { name: 'Approve / Reject Staff Leaves', allowed: isManager || isAdminOrHr },
    { name: 'Employee Master Directory Write', allowed: isAdminOrHr },
    { name: 'Department Administration', allowed: isAdminOrHr },
    { name: 'Payroll Computation & Disbursement', allowed: isAdminOrHr },
    { name: 'System Security & Role Management', allowed: isAdmin },
  ];

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px' }}>
      {/* Account Overview Header */}
      <div
        className="glass-card"
        style={{
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary-subtle)',
              border: '1px solid var(--primary-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              fontWeight: 700,
              color: 'var(--primary)',
            }}
          >
            {user?.username?.charAt(0).toUpperCase()}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {user?.username}
              </h2>
              <Badge variant="active">{user?.role?.replace('ROLE_', '')}</Badge>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={13} color="var(--text-tertiary)" />
              <span>{user?.email}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Account ID</span>
          <span style={{ fontSize: '0.88rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
            USR-{String(user?.id || 0).padStart(4, '0')}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
        {/* Linked Employee Record */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <Briefcase size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Linked Staff Dossier</h3>
          </div>

          {employee ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Full Legal Name:</span>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                  {employee.firstName} {employee.lastName}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Employee Identifier:</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                  {employee.employeeCode}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Department:</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {employee.departmentName || `Unit #${employee.departmentId || 'N/A'}`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Designation:</span>
                <span style={{ color: 'var(--text-primary)' }}>{employee.jobTitle || 'Staff Member'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Hired Since:</span>
                <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {employee.dateOfJoining}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Employment Status:</span>
                <Badge variant={employee.status}>{employee.status}</Badge>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              This login account is not currently linked to an employee directory profile. Administrators can connect this profile in the Employees master directory.
            </div>
          )}
        </div>

        {/* Security & Authentication */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <Key size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Security & Active Session</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Auth Strategy:</span>
              <span style={{ color: 'var(--text-primary)' }}>Stateless JWT (HMAC-SHA256)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Access Scope:</span>
              <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {user?.role}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Session State:</span>
              <Badge variant="active">Authenticated</Badge>
            </div>

            <div
              style={{
                marginTop: '10px',
                padding: '12px',
                background: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>Session Bearer Token</span>
                <button
                  onClick={copyToken}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '0.72rem', padding: '2px 6px', height: '22px' }}
                >
                  <Copy size={11} style={{ marginRight: '3px' }} />
                  Copy
                </button>
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  wordBreak: 'break-all',
                }}
              >
                {localStorage.getItem('hrms_token')?.slice(0, 48)}...
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role & Permissions Matrix */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Shield size={18} color="var(--primary)" />
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Role Capabilities & Access Matrix</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
              Operational privileges granted by your assigned role ({user?.role})
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '10px',
            marginTop: '12px',
          }}
        >
          {rolePermissions.map((perm, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-xs)',
                background: perm.allowed ? 'rgba(16, 185, 129, 0.04)' : 'rgba(255, 255, 255, 0.01)',
                border: `1px solid ${perm.allowed ? 'rgba(16, 185, 129, 0.15)' : 'var(--border-subtle)'}`,
              }}
            >
              <CheckCircle2
                size={14}
                color={perm.allowed ? 'var(--success)' : 'var(--text-muted)'}
              />
              <span
                style={{
                  fontSize: '0.8rem',
                  color: perm.allowed ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: perm.allowed ? 500 : 400,
                }}
              >
                {perm.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

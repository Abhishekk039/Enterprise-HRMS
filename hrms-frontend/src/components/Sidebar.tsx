import React from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  Clock,
  DollarSign,
  Star,
  User,
  Settings,
  LogOut,
  Command,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavTab =
  | 'dashboard'
  | 'employees'
  | 'departments'
  | 'attendance'
  | 'leaves'
  | 'payroll'
  | 'performance'
  | 'profile'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const { user, logout } = useAuth();

  const navSections = [
    {
      title: 'Core Platform',
      items: [
        { id: 'dashboard' as NavTab, label: 'Overview', icon: LayoutDashboard },
        { id: 'employees' as NavTab, label: 'Employees', icon: Users },
        { id: 'departments' as NavTab, label: 'Departments', icon: Building2 },
      ],
    },
    {
      title: 'Time & Operations',
      items: [
        { id: 'attendance' as NavTab, label: 'Attendance', icon: Clock },
        { id: 'leaves' as NavTab, label: 'Time Off & Leaves', icon: CalendarCheck },
      ],
    },
    {
      title: 'Finance & Talent',
      items: [
        { id: 'payroll' as NavTab, label: 'Payroll & Slips', icon: DollarSign },
        { id: 'performance' as NavTab, label: 'Performance', icon: Star },
      ],
    },
    {
      title: 'System',
      items: [
        { id: 'profile' as NavTab, label: 'My Account', icon: User },
        { id: 'settings' as NavTab, label: 'System Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      style={{
        width: '240px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 12px',
        zIndex: 50,
        flexShrink: 0,
      }}
    >
      {/* Workspace Selector (Linear style) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.78rem',
              flexShrink: 0,
            }}
          >
            H
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              Enterprise HRMS
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Global Workspace</div>
          </div>
        </div>
        <ChevronDown size={14} color="var(--text-tertiary)" />
      </div>

      {/* Navigation Sections */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px', paddingRight: '2px' }}>
        {navSections.map((section, sIdx) => (
          <div key={sIdx}>
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-muted)',
                padding: '0 10px 6px 10px',
              }}
            >
              {section.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '7px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.82rem',
                      fontWeight: isActive ? 500 : 400,
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      background: isActive ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'all 0.12s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }
                    }}
                  >
                    <Icon size={16} color={isActive ? 'var(--primary)' : 'currentColor'} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Account Bar */}
      {user && (
        <div
          style={{
            paddingTop: '12px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
            <div
              onClick={() => onTabChange('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                borderRadius: 'var(--radius-sm)',
                background: currentTab === 'profile' ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'var(--primary-subtle)',
                  color: 'var(--primary)',
                  border: '1px solid var(--primary-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  flexShrink: 0,
                }}
              >
                {user.username.slice(0, 1).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.username}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                  {user.role.replace('ROLE_', '')}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="btn btn-ghost btn-icon"
              title="Sign Out"
              style={{ width: '28px', height: '28px', color: 'var(--text-tertiary)' }}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

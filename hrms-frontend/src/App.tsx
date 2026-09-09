import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui/ToastContext';
import { Sidebar, type NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { EmployeesView } from './components/EmployeesView';
import { DepartmentsView } from './components/DepartmentsView';
import { AttendanceView } from './components/AttendanceView';
import { LeavesView } from './components/LeavesView';
import { PayrollView } from './components/PayrollView';
import { PerformanceView } from './components/PerformanceView';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';

const tabTitles: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Workforce Overview',
    subtitle: 'High-level operational metrics, quick punch clock, and launchpad',
  },
  employees: {
    title: 'Employees Directory',
    subtitle: 'Complete staff roster, detailed dossiers, and onboarding',
  },
  departments: {
    title: 'Departments & Teams',
    subtitle: 'Organizational functional units and staffing distribution',
  },
  attendance: {
    title: 'Shift Attendance & Timecard',
    subtitle: 'Daily clock-in/out terminal and shift logs',
  },
  leaves: {
    title: 'Time Off & Leave Requests',
    subtitle: 'Absence planning, PTO balances, and managerial approvals',
  },
  payroll: {
    title: 'Payroll & Remuneration',
    subtitle: 'Monthly compensation calculation, adjustments, and payslips',
  },
  performance: {
    title: 'Performance & Appraisals',
    subtitle: 'Quarterly reviews, star ratings, and developmental targets',
  },
  profile: {
    title: 'My Profile & Account',
    subtitle: 'User credentials, linked employee profile, and permissions matrix',
  },
  settings: {
    title: 'System Settings & Diagnostics',
    subtitle: 'Runtime specifications, API health, and system parameters',
  },
};

const MainLayout: React.FC = () => {
  const { token, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          color: 'var(--text-tertiary)',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-xs)',
            background: 'var(--primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.9rem',
          }}
        >
          H
        </div>
        <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
          Loading Enterprise HRMS...
        </span>
      </div>
    );
  }

  if (!token) {
    return <LoginView />;
  }

  const { title, subtitle } = tabTitles[currentTab] || tabTitles.dashboard;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Navigation Sidebar */}
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header title={title} subtitle={subtitle} />

        <main style={{ flex: 1, overflowY: 'auto' }}>
          {currentTab === 'dashboard' && <DashboardView onNavigate={setCurrentTab} />}
          {currentTab === 'employees' && <EmployeesView />}
          {currentTab === 'departments' && <DepartmentsView />}
          {currentTab === 'attendance' && <AttendanceView />}
          {currentTab === 'leaves' && <LeavesView />}
          {currentTab === 'payroll' && <PayrollView />}
          {currentTab === 'performance' && <PerformanceView />}
          {currentTab === 'profile' && <ProfileView />}
          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainLayout />
      </ToastProvider>
    </AuthProvider>
  );
}

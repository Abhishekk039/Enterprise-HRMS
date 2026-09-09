import React, { useEffect, useState } from 'react';
import {
  Users,
  Building2,
  CalendarCheck,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  UserPlus,
  CalendarPlus,
  PlayCircle,
  FileText,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ui/ToastContext';
import { CardSkeleton, Skeleton } from './ui/Skeleton';
import type { NavTab } from './Sidebar';
import type { Employee, LeaveRequest } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { user, isAdminOrHr } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    presentToday: 0,
    pendingLeaves: 0,
  });

  const [recentEmployees, setRecentEmployees] = useState<Employee[]>([]);
  const [pendingLeavesList, setPendingLeavesList] = useState<LeaveRequest[]>([]);
  const [todayCheckedIn, setTodayCheckedIn] = useState(false);
  const [todayWorkHours, setTodayWorkHours] = useState<number | undefined>(undefined);
  const [punchLoading, setPunchLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes, leaveRes, attRes] = await Promise.all([
        api.getEmployees({ size: 5 }),
        api.getDepartments({ size: 1 }),
        api.getLeaves({ size: 5, status: 'PENDING' }),
        api.getAttendances({ date: new Date().toISOString().split('T')[0], size: 50 }),
      ]);

      setStats({
        totalEmployees: empRes.totalElements || 0,
        totalDepartments: deptRes.totalElements || 0,
        presentToday: attRes.totalElements || 0,
        pendingLeaves: leaveRes.totalElements || 0,
      });

      setRecentEmployees(empRes.content || []);
      setPendingLeavesList(leaveRes.content || []);

      const empIdToUse = user?.employeeId || (empRes.content && empRes.content.length > 0 ? empRes.content[0].id : null);
      if (empIdToUse) {
        try {
          const todayAtt = await api.getTodayAttendance(empIdToUse);
          setTodayCheckedIn(!!(todayAtt && todayAtt.checkInTime && !todayAtt.checkOutTime));
          setTodayWorkHours(todayAtt?.workHours);
        } catch {
          setTodayCheckedIn(false);
          setTodayWorkHours(undefined);
        }
      }
    } catch (e: any) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handlePunch = async () => {
    const targetEmpId = user?.employeeId || (recentEmployees.length > 0 ? recentEmployees[0].id : null);
    if (!targetEmpId) {
      toast.info('No employee profile found in the directory to clock in.');
      return;
    }
    setPunchLoading(true);
    try {
      if (!todayCheckedIn) {
        await api.checkIn(targetEmpId);
        toast.success('Successfully checked in for today’s shift!');
      } else {
        await api.checkOut(targetEmpId);
        toast.success('Successfully checked out. Shift complete!');
      }
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Clock action failed');
    } finally {
      setPunchLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Personnel',
      value: stats.totalEmployees,
      meta: 'Active workforce',
      icon: Users,
      tab: 'employees' as NavTab,
      badge: '+12% YTD',
    },
    {
      title: 'Active Departments',
      value: stats.totalDepartments,
      meta: 'Operational teams',
      icon: Building2,
      tab: 'departments' as NavTab,
      badge: 'Balanced',
    },
    {
      title: 'Present Today',
      value: stats.presentToday,
      meta: `${stats.totalEmployees ? Math.round((stats.presentToday / stats.totalEmployees) * 100) : 0}% attendance rate`,
      icon: Clock,
      tab: 'attendance' as NavTab,
      badge: 'Live',
    },
    {
      title: 'Pending Time Off',
      value: stats.pendingLeaves,
      meta: 'Awaiting manager signoff',
      icon: CalendarCheck,
      tab: 'leaves' as NavTab,
      badge: stats.pendingLeaves > 0 ? 'Requires Action' : 'All Clear',
    },
  ];

  return (
    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Top Banner: Shift Terminal & Operational Highlights */}
      <div
        className="card"
        style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Command Overview</h2>
            <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>
              Q1 2026 Cycle
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
            Welcome back, <strong>{user?.username}</strong>. Real-time overview of workforce attendance, approvals, and payroll.
          </p>
        </div>

        {/* Quick Shift Punch Clock */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            background: 'var(--bg-surface-elevated)',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Your Attendance
            </span>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: todayCheckedIn ? 'var(--success)' : 'var(--text-secondary)' }}>
              {todayCheckedIn ? (todayWorkHours ? `Shift Logged (${todayWorkHours}h)` : 'Clocked In') : 'Not Checked In'}
            </span>
          </div>
          <button
            onClick={handlePunch}
            disabled={punchLoading}
            className={`btn btn-sm ${todayCheckedIn ? 'btn-destructive' : 'btn-primary'}`}
          >
            <Clock size={14} />
            <span>{punchLoading ? 'Saving...' : todayCheckedIn ? 'Clock Out' : 'Clock In'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="card card-hover"
                onClick={() => onNavigate(stat.tab)}
                style={{
                  padding: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    {stat.title}
                  </span>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <Icon size={15} />
                  </div>
                </div>

                <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
                  {stat.value}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
                  <span>{stat.meta}</span>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{stat.badge}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Main Grid: Quick Actions & Recent Personnel */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Quick Operations Launchpad */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} color="var(--primary)" />
              <h3 style={{ fontSize: '0.96rem', fontWeight: 600 }}>Workflow Launchpad</h3>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>Fast Actions</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {isAdminOrHr && (
              <button
                onClick={() => onNavigate('employees')}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '12px' }}
              >
                <UserPlus size={16} color="var(--primary)" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>Add Employee</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>New staff record</div>
                </div>
              </button>
            )}

            <button
              onClick={() => onNavigate('leaves')}
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '12px' }}
            >
              <CalendarPlus size={16} color="var(--warning)" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>Request Leave</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Time off docket</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('attendance')}
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '12px' }}
            >
              <PlayCircle size={16} color="var(--success)" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>Shift Terminal</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Daily timecard logs</div>
              </div>
            </button>

            {isAdminOrHr && (
              <button
                onClick={() => onNavigate('payroll')}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '12px' }}
              >
                <FileText size={16} color="var(--info)" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>Run Payroll</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Monthly compensation</div>
                </div>
              </button>
            )}
          </div>

          {/* Department Staffing Visual Progress */}
          <div style={{ marginTop: '8px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <span>Workforce Allocation Status</span>
              <span>100% Verified</span>
            </div>
            <div style={{ height: '6px', width: '100%', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-pill)', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: '60%', background: 'var(--primary)', height: '100%' }} title="Engineering / Core" />
              <div style={{ width: '25%', background: 'var(--success)', height: '100%' }} title="Operations / HR" />
              <div style={{ width: '15%', background: 'var(--warning)', height: '100%' }} title="Sales / Marketing" />
            </div>
          </div>
        </div>

        {/* Recent Hires / Personnel List */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} color="var(--primary)" />
              <h3 style={{ fontSize: '0.96rem', fontWeight: 600 }}>Recently Onboarded</h3>
            </div>
            <button
              onClick={() => onNavigate('employees')}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.76rem' }}
            >
              <span>View All</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {loading ? (
              <>
                <Skeleton height="36px" />
                <Skeleton height="36px" />
                <Skeleton height="36px" />
              </>
            ) : recentEmployees.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', padding: '20px 0', textAlign: 'center' }}>
                No registered personnel yet.
              </div>
            ) : (
              recentEmployees.map((emp) => (
                <div
                  key={emp.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    fontSize: '0.82rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {emp.firstName.slice(0, 1)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        {emp.firstName} {emp.lastName}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                        {emp.jobTitle || emp.departmentName}
                      </div>
                    </div>
                  </div>

                  <span className="code-pill">{emp.employeeCode}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import {
  Clock,
  Calendar,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Timer,
  UserCheck
} from 'lucide-react';
import { api } from '../services/api';
import type { Attendance, Employee } from '../types';
import { useAuth } from '../context/AuthContext';
import { Modal } from './ui/Modal';
import { SkeletonTableRows } from './ui/Skeleton';
import { EmptyState } from './ui/EmptyState';
import { Badge } from './ui/Badge';
import { useToast } from './ui/ToastContext';

export const AttendanceView: React.FC = () => {
  const { user, isAdminOrHr } = useAuth();
  const toast = useToast();

  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Clock state & Active Employee
  const [activeEmployeeId, setActiveEmployeeId] = useState<number | null>(null);
  const [todayRecord, setTodayRecord] = useState<Attendance | null>(null);
  const [clockLoading, setClockLoading] = useState(false);
  const [notes, setNotes] = useState('');

  // Manual Log Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [manualForm, setManualForm] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    checkInTime: '09:00:00',
    checkOutTime: '17:00:00',
    status: 'PRESENT',
    notes: '',
  });

  const loadTodayShift = async (empId: number) => {
    try {
      const today = await api.getTodayAttendance(empId);
      setTodayRecord(today);
    } catch {
      setTodayRecord(null);
    }
  };

  const loadData = async (targetEmpId?: number) => {
    setLoading(true);
    try {
      const [res, empList] = await Promise.all([
        api.getAttendances({
          page: currentPage,
          size: 10,
          date: dateFilter || undefined,
        }),
        api.getAllEmployees(),
      ]);
      setAttendances(res.content || []);
      setTotalElements(res.totalElements || 0);
      setTotalPages(res.totalPages || 1);
      setEmployees(empList || []);

      const empIdToUse = targetEmpId ?? activeEmployeeId ?? user?.employeeId ?? (empList && empList.length > 0 ? empList[0].id : null);
      if (empIdToUse) {
        if (!activeEmployeeId) {
          setActiveEmployeeId(empIdToUse);
        }
        await loadTodayShift(empIdToUse);
      }
    } catch (e: any) {
      console.error('Failed to load attendance:', e);
      toast.error('Failed to load attendance logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPage, dateFilter]);

  const handleEmployeeSwitch = async (newId: number) => {
    setActiveEmployeeId(newId);
    setClockLoading(true);
    await loadTodayShift(newId);
    setClockLoading(false);
  };

  const handleClockAction = async (type: 'in' | 'out') => {
    const targetId = activeEmployeeId || user?.employeeId;
    if (!targetId) {
      toast.error('Please select an employee profile to record shift attendance.');
      return;
    }
    setClockLoading(true);
    try {
      if (type === 'in') {
        await api.checkIn(targetId, notes || undefined);
        toast.success('Successfully checked in for today’s shift');
      } else {
        await api.checkOut(targetId, notes || undefined);
        toast.success('Successfully checked out. Have a great evening!');
      }
      setNotes('');
      await loadTodayShift(targetId);
      loadData(targetId);
    } catch (err: any) {
      toast.error(err.message || 'Attendance action failed');
    } finally {
      setClockLoading(false);
    }
  };

  const handleManualRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.employeeId) {
      toast.error('Please select an employee');
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('hrms_token');
      const response = await fetch('/api/attendances/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          employeeId: Number(manualForm.employeeId),
          date: manualForm.date,
          checkInTime: manualForm.checkInTime,
          checkOutTime: manualForm.checkOutTime,
          status: manualForm.status,
          notes: manualForm.notes || undefined,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to record attendance');
      }

      toast.success('Shift log recorded successfully');
      setModalOpen(false);
      setManualForm({
        employeeId: '',
        date: new Date().toISOString().split('T')[0],
        checkInTime: '09:00:00',
        checkOutTime: '17:00:00',
        status: 'PRESENT',
        notes: '',
      });
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to record attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAttendances = attendances.filter((att) => {
    if (!statusFilter) return true;
    return att.status === statusFilter;
  });

  const currentEmp = employees.find((e) => e.id === activeEmployeeId);

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner / Live Clock-In Station */}
      <div
        className="glass-card"
        style={{
          padding: '20px 24px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-sm)',
              background: todayRecord?.checkInTime ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
              border: `1px solid ${todayRecord?.checkInTime ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: todayRecord?.checkInTime ? 'var(--success)' : 'var(--primary)',
            }}
          >
            <Timer size={22} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Shift Attendance Terminal
              </span>
              {todayRecord?.checkInTime ? (
                todayRecord.checkOutTime ? (
                  <Badge variant="completed">Completed ({todayRecord.workHours || 0}h)</Badge>
                ) : (
                  <Badge variant="active">Currently On Duty</Badge>
                )
              ) : (
                <Badge variant="neutral">Not Checked In</Badge>
              )}
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '3px' }}>
              {todayRecord?.checkInTime ? (
                <span>
                  Check-in: <strong style={{ color: 'var(--text-secondary)' }}>{todayRecord.checkInTime}</strong>
                  {todayRecord.checkOutTime && (
                    <> • Check-out: <strong style={{ color: 'var(--text-secondary)' }}>{todayRecord.checkOutTime}</strong></>
                  )}
                  {currentEmp && <> • ({currentEmp.firstName} {currentEmp.lastName})</>}
                </span>
              ) : (
                <span>
                  Ready to log shift arrival for{' '}
                  <strong style={{ color: 'var(--text-secondary)' }}>
                    {currentEmp ? `${currentEmp.firstName} ${currentEmp.lastName}` : 'staff member'}
                  </strong>.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Staff Switcher & Punch Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Employee Selector for Admin/HR */}
          {employees.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>Staff:</span>
              <select
                className="form-control"
                style={{ height: '32px', fontSize: '0.78rem', width: '180px' }}
                value={activeEmployeeId || ''}
                onChange={(e) => handleEmployeeSwitch(Number(e.target.value))}
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>
          )}

          {!todayRecord?.checkOutTime && (
            <input
              type="text"
              placeholder="Shift note (optional)..."
              className="form-control"
              style={{ width: '160px', height: '32px', fontSize: '0.78rem' }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          )}

          {!todayRecord?.checkInTime ? (
            <button
              disabled={clockLoading || !activeEmployeeId}
              onClick={() => handleClockAction('in')}
              className="btn btn-primary btn-sm"
            >
              <Clock size={14} />
              <span>{clockLoading ? 'Checking In...' : 'Punch In'}</span>
            </button>
          ) : !todayRecord?.checkOutTime ? (
            <button
              disabled={clockLoading || !activeEmployeeId}
              onClick={() => handleClockAction('out')}
              className="btn btn-danger btn-sm"
            >
              <Clock size={14} />
              <span>{clockLoading ? 'Checking Out...' : 'Punch Out'}</span>
            </button>
          ) : (
            <button
              disabled={clockLoading || !activeEmployeeId}
              onClick={() => handleClockAction('in')}
              className="btn btn-secondary btn-sm"
              title="Record another shift or update"
            >
              <Clock size={14} />
              <span>Shift Complete</span>
            </button>
          )}
        </div>
      </div>

      {/* Control Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Date Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} color="var(--text-tertiary)" />
            <input
              type="date"
              className="form-control"
              style={{ height: '32px', fontSize: '0.78rem', width: '150px' }}
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(0);
              }}
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0 8px', height: '32px', fontSize: '0.75rem' }}
              >
                Reset
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} color="var(--text-tertiary)" />
            <select
              className="form-control"
              style={{ height: '32px', fontSize: '0.78rem', width: '140px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="HALF_DAY">Half Day</option>
              <option value="LATE">Late</option>
            </select>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
            {totalElements} total logs
          </div>
        </div>

        {isAdminOrHr && (
          <button onClick={() => setModalOpen(true)} className="btn btn-primary btn-sm">
            <Plus size={14} />
            <span>Manual Time Log</span>
          </button>
        )}
      </div>

      {/* Attendance Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th style={{ width: '120px' }}>Date</th>
                <th>Employee</th>
                <th style={{ width: '110px' }}>Check In</th>
                <th style={{ width: '110px' }}>Check Out</th>
                <th style={{ width: '90px' }}>Hours</th>
                <th style={{ width: '110px' }}>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonTableRows rows={6} columns={7} />
              ) : filteredAttendances.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 0 }}>
                    <EmptyState
                      icon={Clock}
                      title="No attendance logs found"
                      description={
                        dateFilter || statusFilter
                          ? 'No attendance records match your current filter parameters.'
                          : 'No shift records logged yet. Team members can punch in using the terminal above.'
                      }
                      actionLabel={dateFilter || statusFilter ? 'Clear Filters' : undefined}
                      onAction={() => {
                        setDateFilter('');
                        setStatusFilter('');
                      }}
                    />
                  </td>
                </tr>
              ) : (
                filteredAttendances.map((att) => {
                  const emp = employees.find((e) => e.id === att.employeeId);
                  const empName = att.employeeName || (emp ? `${emp.firstName} ${emp.lastName}` : `EMP-${att.employeeId}`);
                  const empCode = att.employeeCode || (emp ? emp.employeeCode : `ID-${att.employeeId}`);
                  const initials = empName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

                  return (
                    <tr key={att.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {att.date}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: 'var(--primary-subtle)',
                              color: 'var(--primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              flexShrink: 0,
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                              {empName}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                              {empCode}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: att.checkInTime ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                        {att.checkInTime || '—'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: att.checkOutTime ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                        {att.checkOutTime || '—'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 500 }}>
                        {att.workHours != null ? `${att.workHours}h` : '—'}
                      </td>
                      <td>
                        <Badge variant={att.status}>{att.status}</Badge>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {att.notes || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div
            style={{
              padding: '12px 20px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.78rem',
              color: 'var(--text-tertiary)',
            }}
          >
            <span>
              Page {currentPage + 1} of {totalPages} ({totalElements} items)
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px 10px' }}
              >
                <ChevronLeft size={13} />
                <span>Prev</span>
              </button>
              <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px 10px' }}
              >
                <span>Next</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Time Log Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Shift Log"
        subtitle="Manually insert or correct an employee shift record"
      >
        <form onSubmit={handleManualRecord} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Employee *</label>
            <select
              required
              className="form-control"
              value={manualForm.employeeId}
              onChange={(e) => setManualForm({ ...manualForm, employeeId: e.target.value })}
            >
              <option value="">Select an employee...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeCode})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Shift Date *</label>
              <input
                type="date"
                required
                className="form-control"
                value={manualForm.date}
                onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status *</label>
              <select
                className="form-control"
                value={manualForm.status}
                onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
              >
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="HALF_DAY">Half Day</option>
                <option value="LATE">Late</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Check In Time</label>
              <input
                type="time"
                step="1"
                className="form-control"
                value={manualForm.checkInTime}
                onChange={(e) => setManualForm({ ...manualForm, checkInTime: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Check Out Time</label>
              <input
                type="time"
                step="1"
                className="form-control"
                value={manualForm.checkOutTime}
                onChange={(e) => setManualForm({ ...manualForm, checkOutTime: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Administrative Notes</label>
            <input
              type="text"
              placeholder="Reason for manual adjustment..."
              className="form-control"
              value={manualForm.notes}
              onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn btn-secondary btn-sm"
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
              {submitting ? 'Recording...' : 'Save Shift Log'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

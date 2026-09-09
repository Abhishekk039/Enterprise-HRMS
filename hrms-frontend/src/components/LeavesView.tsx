import React, { useEffect, useState } from 'react';
import {
  CalendarCheck,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import type { LeaveRequest, Employee } from '../types';
import { useAuth } from '../context/AuthContext';
import { Modal } from './ui/Modal';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { SkeletonTableRows } from './ui/Skeleton';
import { EmptyState } from './ui/EmptyState';
import { Badge } from './ui/Badge';
import { useToast } from './ui/ToastContext';

export const LeavesView: React.FC = () => {
  const { user, isAdminOrHr, isManager } = useAuth();
  const toast = useToast();

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Apply Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: user?.employeeId ? user.employeeId.toString() : '',
    leaveType: 'CASUAL_LEAVE',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  });

  // Rejection Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  // Cancel Dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [leaveToCancel, setLeaveToCancel] = useState<number | null>(null);

  const loadLeaves = async () => {
    setLoading(true);
    try {
      const [res, empList] = await Promise.all([
        api.getLeaves({
          page: currentPage,
          size: 10,
          status: statusFilter || undefined,
        }),
        api.getAllEmployees(),
      ]);
      setLeaves(res.content || []);
      setTotalElements(res.totalElements || 0);
      setTotalPages(res.totalPages || 1);
      setEmployees(empList || []);
    } catch (e: any) {
      console.error('Failed to load leaves:', e);
      toast.error('Failed to load leave records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [currentPage, statusFilter]);

  // Update employeeId in form if user changes
  useEffect(() => {
    if (user?.employeeId && !formData.employeeId) {
      setFormData((prev) => ({ ...prev, employeeId: user.employeeId!.toString() }));
    }
  }, [user]);

  const calculateDays = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return 0;
    const diffTime = Math.abs(e.getTime() - s.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId) {
      toast.error('Please select an employee profile');
      return;
    }
    setSubmitting(true);
    try {
      await api.applyLeave({
        employeeId: Number(formData.employeeId),
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
      });
      toast.success('Time off request submitted successfully');
      setModalOpen(false);
      setFormData({
        employeeId: user?.employeeId ? user.employeeId.toString() : '',
        leaveType: 'CASUAL_LEAVE',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reason: '',
      });
      loadLeaves();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.updateLeaveStatus(id, 'APPROVED');
      toast.success('Leave request approved');
      loadLeaves();
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve request');
    }
  };

  const openRejectModal = (id: number) => {
    setSelectedLeaveId(id);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeaveId) return;
    setRejecting(true);
    try {
      await api.updateLeaveStatus(selectedLeaveId, 'REJECTED', rejectionReason);
      toast.info('Leave request rejected');
      setRejectModalOpen(false);
      setSelectedLeaveId(null);
      loadLeaves();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject request');
    } finally {
      setRejecting(false);
    }
  };

  const confirmCancel = (id: number) => {
    setLeaveToCancel(id);
    setCancelDialogOpen(true);
  };

  const handleCancel = async () => {
    if (!leaveToCancel) return;
    try {
      await api.cancelLeave(leaveToCancel);
      toast.info('Leave request cancelled');
      setCancelDialogOpen(false);
      setLeaveToCancel(null);
      loadLeaves();
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel request');
    }
  };

  const statusTabs = [
    { id: '', label: 'All Requests' },
    { id: 'PENDING', label: 'Pending' },
    { id: 'APPROVED', label: 'Approved' },
    { id: 'REJECTED', label: 'Rejected' },
    { id: 'CANCELLED', label: 'Cancelled' },
  ];

  const calculatedDays = calculateDays(formData.startDate, formData.endDate);

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Action and Filter Tab Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Status Filter Tabs (Linear style segmented bar) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '3px',
            gap: '2px',
          }}
        >
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setCurrentPage(0);
                }}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <button onClick={() => setModalOpen(true)} className="btn btn-primary btn-sm">
          <Plus size={14} />
          <span>Request Time Off</span>
        </button>
      </div>

      {/* Requests Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th style={{ width: '130px' }}>Type</th>
                <th style={{ width: '180px' }}>Dates</th>
                <th style={{ width: '70px' }}>Days</th>
                <th>Reason</th>
                <th style={{ width: '110px' }}>Status</th>
                <th style={{ width: '130px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonTableRows rows={6} columns={7} />
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 0 }}>
                    <EmptyState
                      icon={CalendarCheck}
                      title="No time off requests found"
                      description={
                        statusFilter
                          ? `No requests currently marked as ${statusFilter.toLowerCase()}.`
                          : 'No leave applications submitted yet. Click "Request Time Off" to apply.'
                      }
                      actionLabel={statusFilter ? 'Show All Requests' : 'Request Time Off'}
                      onAction={statusFilter ? () => setStatusFilter('') : () => setModalOpen(true)}
                    />
                  </td>
                </tr>
              ) : (
                leaves.map((lv) => {
                  const emp = employees.find((e) => e.id === lv.employeeId);
                  const empName = lv.employeeName || (emp ? `${emp.firstName} ${emp.lastName}` : `EMP-${lv.employeeId}`);
                  const empCode = lv.employeeCode || (emp ? emp.employeeCode : `ID-${lv.employeeId}`);
                  const initials = empName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

                  const canManage = isAdminOrHr || isManager;
                  const isPending = lv.status === 'PENDING';

                  return (
                    <tr key={lv.id}>
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
                      <td>
                        <Badge variant="neutral">
                          {lv.leaveType.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {lv.startDate} → {lv.endDate}
                      </td>
                      <td style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                        {lv.totalDays || 1}d
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: '240px' }}>
                        <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {lv.reason}
                        </div>
                        {lv.rejectionReason && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--danger)', marginTop: '2px' }}>
                            Declined: {lv.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td>
                        <Badge variant={lv.status as any}>{lv.status}</Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                          {canManage && isPending && (
                            <>
                              <button
                                onClick={() => handleApprove(lv.id)}
                                className="btn btn-ghost btn-icon"
                                title="Approve Leave"
                                style={{ color: 'var(--success)', width: '28px', height: '28px' }}
                              >
                                <CheckCircle2 size={15} />
                              </button>
                              <button
                                onClick={() => openRejectModal(lv.id)}
                                className="btn btn-ghost btn-icon"
                                title="Reject Leave"
                                style={{ color: 'var(--danger)', width: '28px', height: '28px' }}
                              >
                                <XCircle size={15} />
                              </button>
                            </>
                          )}

                          {/* Allow employee or admin to cancel pending leave */}
                          {isPending && !canManage && user?.employeeId === lv.employeeId && (
                            <button
                              onClick={() => confirmCancel(lv.id)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.72rem', padding: '2px 8px', height: '24px' }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
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
              Page {currentPage + 1} of {totalPages} ({totalElements} requests)
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

      {/* Apply Time Off Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Request Time Off"
        subtitle="Submit a vacation or personal absence request for managerial approval"
      >
        <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Employee *</label>
            <select
              required
              disabled={!isAdminOrHr && !isManager && !!user?.employeeId}
              className="form-control"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
            >
              <option value="">Select applicant...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeCode})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Leave Category *</label>
            <select
              className="form-control"
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
            >
              <option value="CASUAL_LEAVE">Casual Leave</option>
              <option value="SICK_LEAVE">Sick Leave</option>
              <option value="ANNUAL_LEAVE">Annual / Vacation Leave</option>
              <option value="MATERNITY_LEAVE">Maternity Leave</option>
              <option value="PATERNITY_LEAVE">Paternity Leave</option>
              <option value="UNPAID_LEAVE">Unpaid Leave</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                required
                className="form-control"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date *</label>
              <input
                type="date"
                required
                className="form-control"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          {calculatedDays > 0 && (
            <div
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-tertiary)',
                background: 'var(--bg-surface-elevated)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-xs)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>Duration calculation:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{calculatedDays} calendar day(s)</strong>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Reason / Justification *</label>
            <textarea
              required
              rows={3}
              className="form-control"
              placeholder="State the reason for this leave request..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
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
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Decline Leave Request"
        subtitle="Provide a constructive reason for rejecting this absence"
      >
        <form onSubmit={handleRejectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Rejection Reason *</label>
            <textarea
              required
              rows={3}
              className="form-control"
              placeholder="Explain why this request cannot be approved at this time..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              autoFocus
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
              onClick={() => setRejectModalOpen(false)}
              className="btn btn-secondary btn-sm"
              disabled={rejecting}
            >
              Cancel
            </button>
            <button type="submit" disabled={rejecting} className="btn btn-danger btn-sm">
              {rejecting ? 'Declining...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={cancelDialogOpen}
        title="Cancel Leave Request"
        message="Are you sure you want to withdraw your pending leave request?"
        confirmText="Withdraw Request"
        confirmVariant="danger"
        onConfirm={handleCancel}
        onCancel={() => {
          setCancelDialogOpen(false);
          setLeaveToCancel(null);
        }}
      />
    </div>
  );
};

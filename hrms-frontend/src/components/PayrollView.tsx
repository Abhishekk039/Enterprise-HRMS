import React, { useEffect, useState, useMemo } from 'react';
import {
  DollarSign,
  Plus,
  CheckCircle2,
  Calendar,
  Filter,
  FileText,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Receipt,
  Download
} from 'lucide-react';
import { api } from '../services/api';
import type { Payroll, Employee } from '../types';
import { useAuth } from '../context/AuthContext';
import { Modal } from './ui/Modal';
import { SkeletonTableRows } from './ui/Skeleton';
import { EmptyState } from './ui/EmptyState';
import { Badge } from './ui/Badge';
import { useToast } from './ui/ToastContext';

export const PayrollView: React.FC = () => {
  const { isAdminOrHr } = useAuth();
  const toast = useToast();

  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [yearFilter, setYearFilter] = useState<number | undefined>(currentYear);
  const [monthFilter, setMonthFilter] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Generate Payroll Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    payPeriodMonth: currentMonth,
    payPeriodYear: currentYear,
    allowances: '0',
    deductions: '0',
    paymentMethod: 'BANK_TRANSFER',
    notes: '',
  });

  // Payslip Detail Modal
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [res, empList] = await Promise.all([
        api.getPayrolls({
          page: currentPage,
          size: 10,
          year: yearFilter,
          month: monthFilter,
          status: statusFilter || undefined,
        }),
        api.getAllEmployees(),
      ]);
      setPayrolls(res.content || []);
      setTotalElements(res.totalElements || 0);
      setTotalPages(res.totalPages || 1);
      setEmployees(empList || []);
    } catch (e: any) {
      console.error('Failed to load payroll:', e);
      toast.error('Failed to load payroll records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPage, yearFilter, monthFilter, statusFilter]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId) {
      toast.error('Please select an employee profile');
      return;
    }
    setSubmitting(true);
    try {
      await api.generatePayroll({
        employeeId: Number(formData.employeeId),
        payPeriodMonth: Number(formData.payPeriodMonth),
        payPeriodYear: Number(formData.payPeriodYear),
        allowances: formData.allowances ? Number(formData.allowances) : 0,
        deductions: formData.deductions ? Number(formData.deductions) : 0,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || undefined,
      });
      toast.success('Payroll slip generated successfully');
      setModalOpen(false);
      setFormData({
        employeeId: '',
        payPeriodMonth: currentMonth,
        payPeriodYear: currentYear,
        allowances: '0',
        deductions: '0',
        paymentMethod: 'BANK_TRANSFER',
        notes: '',
      });
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate payroll');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPaid = async (id: number) => {
    try {
      await api.updatePayrollStatus(id, 'PAID');
      toast.success('Payroll disbursed and marked as PAID');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update payroll status');
    }
  };

  // Compute page totals
  const totalNet = useMemo(() => {
    return payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);
  }, [payrolls]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Summary Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
        }}
      >
        <div
          className="glass-card"
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}
          >
            <DollarSign size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Current Batch Total
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              ${totalNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div
          className="glass-card"
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--success)',
            }}
          >
            <Receipt size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Generated Statements
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {totalElements}
            </div>
          </div>
        </div>

        <div
          className="glass-card"
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--warning)',
            }}
          >
            <Calendar size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Fiscal Period
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {monthFilter ? `${monthNames[monthFilter - 1]} ` : ''}{yearFilter || 'All Years'}
            </div>
          </div>
        </div>
      </div>

      {/* Control & Filter Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Year Filter */}
          <select
            className="form-control"
            style={{ height: '32px', fontSize: '0.78rem', width: '110px' }}
            value={yearFilter || ''}
            onChange={(e) => {
              setYearFilter(e.target.value ? Number(e.target.value) : undefined);
              setCurrentPage(0);
            }}
          >
            <option value="">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>

          {/* Month Filter */}
          <select
            className="form-control"
            style={{ height: '32px', fontSize: '0.78rem', width: '130px' }}
            value={monthFilter || ''}
            onChange={(e) => {
              setMonthFilter(e.target.value ? Number(e.target.value) : undefined);
              setCurrentPage(0);
            }}
          >
            <option value="">All Months</option>
            {monthNames.map((name, i) => (
              <option key={i + 1} value={i + 1}>
                {name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="form-control"
            style={{ height: '32px', fontSize: '0.78rem', width: '130px' }}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(0);
            }}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {isAdminOrHr && (
          <button onClick={() => setModalOpen(true)} className="btn btn-primary btn-sm">
            <Plus size={14} />
            <span>Generate Payroll</span>
          </button>
        )}
      </div>

      {/* Payroll Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th style={{ width: '130px' }}>Pay Period</th>
                <th style={{ width: '110px' }}>Base Salary</th>
                <th style={{ width: '100px' }}>Allowances</th>
                <th style={{ width: '100px' }}>Deductions</th>
                <th style={{ width: '110px' }}>Net Pay</th>
                <th style={{ width: '100px' }}>Status</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonTableRows rows={6} columns={8} />
              ) : payrolls.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 0 }}>
                    <EmptyState
                      icon={DollarSign}
                      title="No payroll records found"
                      description={
                        yearFilter || monthFilter || statusFilter
                          ? 'No compensation slips match your chosen period filters.'
                          : 'No payroll records have been generated yet.'
                      }
                      actionLabel={isAdminOrHr ? 'Generate First Payroll' : undefined}
                      onAction={isAdminOrHr ? () => setModalOpen(true) : undefined}
                    />
                  </td>
                </tr>
              ) : (
                payrolls.map((p) => {
                  const emp = employees.find((e) => e.id === p.employeeId);
                  const empName = p.employeeName || (emp ? `${emp.firstName} ${emp.lastName}` : `EMP-${p.employeeId}`);
                  const empCode = p.employeeCode || (emp ? emp.employeeCode : `ID-${p.employeeId}`);
                  const initials = empName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

                  const periodLabel = `${monthNames[(p.payPeriodMonth || 1) - 1]?.slice(0, 3)} ${p.payPeriodYear}`;

                  return (
                    <tr key={p.id}>
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
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {periodLabel}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        ${(p.basicSalary || 0).toLocaleString()}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--success)' }}>
                        +${(p.allowances || 0).toLocaleString()}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--danger)' }}>
                        -${(p.deductions || 0).toLocaleString()}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        ${(p.netSalary || 0).toLocaleString()}
                      </td>
                      <td>
                        <Badge variant={p.paymentStatus}>{p.paymentStatus}</Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                          <button
                            onClick={() => setSelectedPayroll(p)}
                            className="btn btn-ghost btn-icon"
                            title="View Breakdown"
                            style={{ width: '28px', height: '28px', color: 'var(--text-secondary)' }}
                          >
                            <FileText size={14} />
                          </button>

                          {isAdminOrHr && p.paymentStatus === 'PENDING' && (
                            <button
                              onClick={() => handleMarkPaid(p.id)}
                              className="btn btn-secondary btn-sm"
                              title="Mark as Paid"
                              style={{
                                fontSize: '0.72rem',
                                padding: '2px 8px',
                                height: '24px',
                                color: 'var(--success)',
                                borderColor: 'rgba(16, 185, 129, 0.3)',
                              }}
                            >
                              <CheckCircle2 size={12} style={{ marginRight: '3px' }} />
                              Disburse
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
              Page {currentPage + 1} of {totalPages} ({totalElements} statements)
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

      {/* Generate Payroll Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Generate Payroll Statement"
        subtitle="Calculate remuneration, adjustments, and issue a compensation slip"
      >
        <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Employee *</label>
            <select
              required
              className="form-control"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
            >
              <option value="">Select an employee...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeCode}) — Base: ${emp.salary || 0}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Period Month *</label>
              <select
                className="form-control"
                value={formData.payPeriodMonth}
                onChange={(e) => setFormData({ ...formData, payPeriodMonth: Number(e.target.value) })}
              >
                {monthNames.map((name, i) => (
                  <option key={i + 1} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Period Year *</label>
              <input
                type="number"
                required
                className="form-control"
                value={formData.payPeriodYear}
                onChange={(e) => setFormData({ ...formData, payPeriodYear: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Allowances ($)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={formData.allowances}
                onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Deductions ($)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={formData.deductions}
                onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Disbursement Method</label>
            <select
              className="form-control"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            >
              <option value="BANK_TRANSFER">Direct Bank Transfer</option>
              <option value="CHEQUE">Corporate Cheque</option>
              <option value="CASH">Cash Voucher</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Internal Memo</label>
            <input
              type="text"
              placeholder="e.g. Annual bonus included, overtime bonus..."
              className="form-control"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
              {submitting ? 'Generating...' : 'Issue Statement'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Payslip Breakdown Modal */}
      <Modal
        isOpen={!!selectedPayroll}
        onClose={() => setSelectedPayroll(null)}
        title="Compensation Statement"
        subtitle={`Period: ${selectedPayroll ? `${monthNames[(selectedPayroll.payPeriodMonth || 1) - 1]} ${selectedPayroll.payPeriodYear}` : ''}`}
      >
        {selectedPayroll && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                background: 'var(--bg-surface-elevated)',
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Recipient:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedPayroll.employeeName || `EMP-${selectedPayroll.employeeId}`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Disbursement:</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {selectedPayroll.paymentMethod ? selectedPayroll.paymentMethod.replace('_', ' ') : 'Bank Transfer'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Status:</span>
                <Badge variant={selectedPayroll.paymentStatus}>{selectedPayroll.paymentStatus}</Badge>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>Base Salary</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                  ${(selectedPayroll.basicSalary || 0).toLocaleString()}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>Allowances & Perks</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>
                  +${(selectedPayroll.allowances || 0).toLocaleString()}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>Statutory Deductions & Taxes</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--danger)' }}>
                  -${(selectedPayroll.deductions || 0).toLocaleString()}
                </span>
              </div>

              <div
                style={{
                  marginTop: '8px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Net Remuneration
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                  ${(selectedPayroll.netSalary || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {selectedPayroll.notes && (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                Note: {selectedPayroll.notes}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedPayroll(null)}
                className="btn btn-secondary btn-sm"
              >
                Close Statement
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

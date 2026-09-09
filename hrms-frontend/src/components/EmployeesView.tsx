import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  DollarSign
} from 'lucide-react';
import { api } from '../services/api';
import type { Employee, Department } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ui/ToastContext';
import { Modal } from './ui/Modal';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { TableSkeleton } from './ui/Skeleton';
import { EmptyState } from './ui/EmptyState';
import { Badge } from './ui/Badge';

export const EmployeesView: React.FC = () => {
  const { isAdminOrHr } = useAuth();
  const toast = useToast();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(8);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<number | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const [loading, setLoading] = useState(true);

  // Onboard Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Detail Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Delete Confirm Dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    departmentId: '',
    employeeCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfJoining: new Date().toISOString().split('T')[0],
    jobTitle: '',
    salary: '',
    status: 'ACTIVE',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [empRes, deptList] = await Promise.all([
        api.getEmployees({
          page: currentPage,
          size: pageSize,
          search: search.trim() || undefined,
          departmentId: selectedDept,
          status: selectedStatus || undefined,
        }),
        api.getAllDepartments(),
      ]);

      setEmployees(empRes.content || []);
      setTotalElements(empRes.totalElements || 0);
      setTotalPages(empRes.totalPages || 1);
      setDepartments(deptList || []);
    } catch (e: any) {
      toast.error('Failed to load employees roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPage, search, selectedDept, selectedStatus]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createEmployee({
        ...formData,
        departmentId: Number(formData.departmentId),
        salary: formData.salary ? Number(formData.salary) : undefined,
      });
      toast.success(`Successfully onboarded ${formData.firstName} ${formData.lastName}`);
      setModalOpen(false);
      setFormData({
        departmentId: '',
        employeeCode: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfJoining: new Date().toISOString().split('T')[0],
        jobTitle: '',
        salary: '',
        status: 'ACTIVE',
      });
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create employee');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;
    setDeleting(true);
    try {
      await api.deleteEmployee(employeeToDelete.id);
      toast.success(`Deleted employee record ${employeeToDelete.employeeCode}`);
      setDeleteConfirmOpen(false);
      setEmployeeToDelete(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete employee');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Personnel Directory</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
            Showing {totalElements} registered employees in organization
          </p>
        </div>

        {isAdminOrHr && (
          <button onClick={() => setModalOpen(true)} className="btn btn-primary btn-sm">
            <Plus size={14} />
            <span>Onboard Employee</span>
          </button>
        )}
      </div>

      {/* Filter Controls Toolbar */}
      <div
        className="card"
        style={{
          padding: '12px 16px',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={14} color="var(--text-tertiary)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '32px', fontSize: '0.82rem' }}
            placeholder="Search by name, email, or code..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(0);
            }}
          />
        </div>

        <select
          className="form-control"
          style={{ width: 'auto', minWidth: '160px', fontSize: '0.82rem' }}
          value={selectedDept || ''}
          onChange={(e) => {
            setSelectedDept(e.target.value ? Number(e.target.value) : undefined);
            setCurrentPage(0);
          }}
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <select
          className="form-control"
          style={{ width: 'auto', minWidth: '130px', fontSize: '0.82rem' }}
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setCurrentPage(0);
          }}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        {(search || selectedDept !== undefined || selectedStatus) && (
          <button
            onClick={() => {
              setSearch('');
              setSelectedDept(undefined);
              setSelectedStatus('');
              setCurrentPage(0);
            }}
            className="btn btn-ghost btn-sm"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Employees Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Employee</th>
                <th>Department</th>
                <th>Role / Title</th>
                <th>Salary</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={6} cols={7} />
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={Users}
                      title="No employees found"
                      description="No records match your filter criteria. Try adjusting filters or onboard a new employee."
                      actionLabel={isAdminOrHr ? 'Onboard Employee' : undefined}
                      onAction={isAdminOrHr ? () => setModalOpen(true) : undefined}
                    />
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <span className="code-pill">{emp.employeeCode}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            fontSize: '0.72rem',
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
                            {emp.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {emp.departmentName}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                        <Briefcase size={13} color="var(--text-tertiary)" />
                        <span>{emp.jobTitle || 'Staff Member'}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                        ${emp.salary ? emp.salary.toLocaleString() : '0.00'}
                      </span>
                    </td>
                    <td>
                      <Badge variant={emp.status === 'ACTIVE' ? 'active' : 'inactive'}>
                        {emp.status}
                      </Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => {
                            setSelectedEmployee(emp);
                            setDetailModalOpen(true);
                          }}
                          className="btn btn-ghost btn-sm"
                          title="View Profile"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>
                        {isAdminOrHr && (
                          <button
                            onClick={() => {
                              setEmployeeToDelete(emp);
                              setDeleteConfirmOpen(true);
                            }}
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--danger)' }}
                            title="Delete Record"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 18px',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.8rem',
              color: 'var(--text-tertiary)',
            }}
          >
            <div>
              Page {currentPage + 1} of {totalPages} ({totalElements} total)
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="btn btn-secondary btn-sm"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="btn btn-secondary btn-sm"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Onboard Employee Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Onboard New Employee"
        subtitle="Establish employee dossier and assign organizational unit"
        maxWidth="540px"
      >
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Employee Code *</label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="e.g. EMP-101"
                value={formData.employeeCode}
                onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                required
                className="form-control"
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                required
                className="form-control"
                placeholder="work.email@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                placeholder="+1 555-0100"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Job Title</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Lead Engineer"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Monthly Salary ($)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                placeholder="6000.00"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Joining Date</label>
              <input
                type="date"
                required
                className="form-control"
                value={formData.dateOfJoining}
                onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-control"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving...' : 'Save Employee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Employee Detail Dossier Modal */}
      {selectedEmployee && (
        <Modal
          isOpen={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedEmployee(null);
          }}
          title="Employee Profile Dossier"
          subtitle={selectedEmployee.employeeCode}
          maxWidth="460px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '10px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'var(--primary-subtle)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  border: '1px solid var(--primary-border)',
                }}
              >
                {selectedEmployee.firstName.slice(0, 1)}
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>
                  {selectedEmployee.firstName} {selectedEmployee.lastName}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                  {selectedEmployee.jobTitle || 'Staff Member'} • {selectedEmployee.departmentName}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.82rem' }}>
              <div>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Email</div>
                <div style={{ marginTop: '2px', color: 'var(--text-primary)' }}>{selectedEmployee.email}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Phone</div>
                <div style={{ marginTop: '2px', color: 'var(--text-primary)' }}>{selectedEmployee.phone || '—'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Joined Date</div>
                <div style={{ marginTop: '2px', color: 'var(--text-primary)' }}>{selectedEmployee.dateOfJoining}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Monthly Salary</div>
                <div style={{ marginTop: '2px', color: 'var(--success)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                  ${selectedEmployee.salary ? selectedEmployee.salary.toLocaleString() : '0.00'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button onClick={() => setDetailModalOpen(false)} className="btn btn-secondary btn-sm">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setEmployeeToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Employee Record"
        message={`Are you sure you want to delete ${employeeToDelete?.firstName} ${employeeToDelete?.lastName} (${employeeToDelete?.employeeCode})? This action cannot be undone.`}
        confirmLabel="Delete Record"
        loading={deleting}
      />
    </div>
  );
};

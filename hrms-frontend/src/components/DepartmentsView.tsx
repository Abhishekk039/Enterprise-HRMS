import React, { useEffect, useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Trash2,
  Search,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import type { Department } from '../types';
import { useAuth } from '../context/AuthContext';
import { Modal } from './ui/Modal';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { SkeletonCard } from './ui/Skeleton';
import { EmptyState } from './ui/EmptyState';
import { Badge } from './ui/Badge';
import { useToast } from './ui/ToastContext';

export const DepartmentsView: React.FC = () => {
  const { isAdminOrHr } = useAuth();
  const toast = useToast();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Creation modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const data = await api.getAllDepartments();
      setDepartments(data || []);
    } catch (e: any) {
      console.error('Failed to load departments:', e);
      toast.error('Failed to load department records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const filteredDepartments = useMemo(() => {
    if (!searchQuery.trim()) return departments;
    const q = searchQuery.toLowerCase();
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q))
    );
  }, [departments, searchQuery]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await api.createDepartment({ name: name.trim(), description: description.trim() });
      toast.success(`Department "${name.trim()}" created successfully`);
      setName('');
      setDescription('');
      setModalOpen(false);
      loadDepartments();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create department');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (dept: Department) => {
    setDeptToDelete(dept);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deptToDelete) return;
    setDeleting(true);
    try {
      await api.deleteDepartment(deptToDelete.id);
      toast.success(`Department "${deptToDelete.name}" was removed`);
      setDeleteDialogOpen(false);
      setDeptToDelete(null);
      loadDepartments();
    } catch (err: any) {
      toast.error(err.message || 'Cannot delete department. Ensure no employees are assigned.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Action & Filter Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '240px' }}>
          <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)',
              }}
            />
            <input
              type="text"
              placeholder="Search departments..."
              className="form-control"
              style={{ paddingLeft: '32px', height: '34px', fontSize: '0.82rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
            {filteredDepartments.length} {filteredDepartments.length === 1 ? 'unit' : 'units'} active
          </div>
        </div>

        {isAdminOrHr && (
          <button onClick={() => setModalOpen(true)} className="btn btn-primary btn-sm">
            <Plus size={14} />
            <span>New Department</span>
          </button>
        )}
      </div>

      {/* Grid of Departments */}
      {loading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} lines={3} />
          ))}
        </div>
      ) : filteredDepartments.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={searchQuery ? 'No matching departments' : 'No departments configured'}
          description={
            searchQuery
              ? `No department names match "${searchQuery}". Try a different search term.`
              : 'Establish organizational structural units to group employees, track headcounts, and manage team roles.'
          }
          actionLabel={isAdminOrHr && !searchQuery ? 'Create First Department' : undefined}
          onAction={isAdminOrHr && !searchQuery ? () => setModalOpen(true) : undefined}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {filteredDepartments.map((dept) => {
            const initial = dept.name.charAt(0).toUpperCase();
            const formattedDate = dept.createdAt
              ? new Date(dept.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : null;

            return (
              <div
                key={dept.id}
                className="glass-card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          fontSize: '0.95rem',
                          color: 'var(--primary)',
                        }}
                      >
                        {initial}
                      </div>
                      <div>
                        <h3
                          style={{
                            fontSize: '0.96rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            margin: 0,
                          }}
                        >
                          {dept.name}
                        </h3>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            color: 'var(--text-tertiary)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          DEP-{String(dept.id).padStart(3, '0')}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Badge variant="active">Active</Badge>
                      {isAdminOrHr && (
                        <button
                          onClick={() => confirmDelete(dept)}
                          className="btn btn-ghost btn-icon"
                          title="Delete Department"
                          style={{ color: 'var(--text-tertiary)', width: '28px', height: '28px' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  <p
                    style={{
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.5',
                      margin: '0 0 16px 0',
                      minHeight: '40px',
                    }}
                  >
                    {dept.description || 'General organizational functional unit and resource allocation team.'}
                  </p>
                </div>

                <div
                  style={{
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.74rem',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={13} />
                    <span>{formattedDate ? `Est. ${formattedDate}` : 'Operational'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                    <Layers size={13} />
                    <span>Unit #{dept.id}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Creation Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Department"
        subtitle="Establish a new organizational functional team"
      >
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Department Name *</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="e.g. Infrastructure Engineering, Product Design, Finance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description & Scope</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Primary responsibilities, deliverables, or operational scope..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
              marginTop: '8px',
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
              {submitting ? 'Creating...' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Department"
        message={`Are you sure you want to delete "${deptToDelete?.name}"? All assigned staff must be reassigned first.`}
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeptToDelete(null);
        }}
      />
    </div>
  );
};

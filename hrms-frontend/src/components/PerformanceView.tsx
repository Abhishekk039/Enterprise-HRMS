import React, { useEffect, useState } from 'react';
import {
  Star,
  Plus,
  CheckCircle2,
  MessageSquare,
  Target,
  User,
  ChevronLeft,
  ChevronRight,
  Award,
  Calendar,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import type { PerformanceReview, Employee } from '../types';
import { useAuth } from '../context/AuthContext';
import { Modal } from './ui/Modal';
import { SkeletonCard } from './ui/Skeleton';
import { EmptyState } from './ui/EmptyState';
import { Badge } from './ui/Badge';
import { useToast } from './ui/ToastContext';

export const PerformanceView: React.FC = () => {
  const { user, isAdminOrHr, isManager } = useAuth();
  const toast = useToast();

  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Evaluation Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    reviewPeriod: 'Q1 2026',
    rating: 5,
    feedback: '',
    goals: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [res, empList] = await Promise.all([
        api.getReviews({
          page: currentPage,
          size: 9,
        }),
        api.getAllEmployees(),
      ]);
      setReviews(res.content || []);
      setTotalElements(res.totalElements || 0);
      setTotalPages(res.totalPages || 1);
      setEmployees(empList || []);
    } catch (e: any) {
      console.error('Failed to load performance reviews:', e);
      toast.error('Failed to load performance evaluations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPage]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId) {
      toast.error('Please select an employee');
      return;
    }
    setSubmitting(true);
    try {
      await api.createReview({
        employeeId: Number(formData.employeeId),
        reviewPeriod: formData.reviewPeriod,
        rating: Number(formData.rating),
        feedback: formData.feedback,
        goals: formData.goals || undefined,
      });
      toast.success('Performance review recorded successfully');
      setModalOpen(false);
      setFormData({
        employeeId: '',
        reviewPeriod: 'Q1 2026',
        rating: 5,
        feedback: '',
        goals: '',
      });
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcknowledge = async (id: number) => {
    try {
      await api.acknowledgeReview(id);
      toast.success('Appraisal acknowledged');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to acknowledge review');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div style={{ display: 'flex', gap: '3px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            fill={star <= rating ? '#f59e0b' : 'transparent'}
            color={star <= rating ? '#f59e0b' : 'var(--border-strong)'}
          />
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Action Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
          {totalElements} completed performance evaluations
        </div>

        {(isAdminOrHr || isManager) && (
          <button onClick={() => setModalOpen(true)} className="btn btn-primary btn-sm">
            <Plus size={14} />
            <span>Conduct Review</span>
          </button>
        )}
      </div>

      {/* Grid of Reviews */}
      {loading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '16px',
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} lines={4} />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No evaluations recorded yet"
          description="Performance appraisals and goal tracking will appear here once managers conduct talent evaluations."
          actionLabel={isAdminOrHr || isManager ? 'Conduct First Evaluation' : undefined}
          onAction={isAdminOrHr || isManager ? () => setModalOpen(true) : undefined}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '16px',
          }}
        >
          {reviews.map((rev) => {
            const emp = employees.find((e) => e.id === rev.employeeId);
            const empName = rev.employeeName || (emp ? `${emp.firstName} ${emp.lastName}` : `EMP-${rev.employeeId}`);
            const empCode = rev.employeeCode || (emp ? emp.employeeCode : `ID-${rev.employeeId}`);
            const initials = empName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

            const isCurrentEmployee = user?.employeeId === rev.employeeId;

            return (
              <div
                key={rev.id}
                className="glass-card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'var(--primary-subtle)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        {initials}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                          {empName}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                          {empCode}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <Badge variant="neutral">{rev.reviewPeriod}</Badge>
                      {renderStars(rev.rating)}
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                      Manager Feedback
                    </div>
                    <p
                      style={{
                        fontSize: '0.82rem',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.5',
                        margin: 0,
                      }}
                    >
                      "{rev.feedback}"
                    </p>
                  </div>

                  {rev.goals && (
                    <div
                      style={{
                        background: 'var(--bg-surface-elevated)',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '2px' }}>
                        <Target size={12} />
                        <span>Development Objectives</span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                        {rev.goals}
                      </p>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                    Evaluated by {rev.reviewerUsername || 'Management'}
                  </div>

                  {rev.status === 'ACKNOWLEDGED' ? (
                    <Badge variant="active">
                      <CheckCircle2 size={11} style={{ marginRight: '3px' }} />
                      Acknowledged
                    </Badge>
                  ) : isCurrentEmployee ? (
                    <button
                      onClick={() => handleAcknowledge(rev.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.72rem', padding: '2px 8px', height: '24px' }}
                    >
                      Sign Acknowledgment
                    </button>
                  ) : (
                    <Badge variant="pending">Pending Acknowledgment</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.78rem',
            color: 'var(--text-tertiary)',
            paddingTop: '8px',
          }}
        >
          <span>
            Page {currentPage + 1} of {totalPages} ({totalElements} evaluations)
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

      {/* Review Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Conduct Performance Review"
        subtitle="Evaluate an employee's contributions, achievements, and future development goals"
      >
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  {emp.firstName} {emp.lastName} ({emp.employeeCode})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Review Cycle *</label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="e.g. Q1 2026, Annual 2025"
                value={formData.reviewPeriod}
                onChange={(e) => setFormData({ ...formData, reviewPeriod: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Rating (1 to 5 Stars) *</label>
              <select
                className="form-control"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
              >
                <option value={5}>5 Stars - Outstanding</option>
                <option value={4}>4 Stars - Exceeds Expectations</option>
                <option value={3}>3 Stars - Meets Expectations</option>
                <option value={2}>2 Stars - Needs Improvement</option>
                <option value={1}>1 Star - Unsatisfactory</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Evaluation Narrative & Feedback *</label>
            <textarea
              required
              rows={3}
              className="form-control"
              placeholder="Highlight key strengths, accomplishments, and areas for refinement..."
              value={formData.feedback}
              onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Future Growth Goals & Milestones</label>
            <textarea
              rows={2}
              className="form-control"
              placeholder="Specific, measurable targets for the next evaluation cycle..."
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
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
              {submitting ? 'Submitting...' : 'Save Evaluation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

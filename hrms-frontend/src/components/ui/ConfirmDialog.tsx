import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmText?: string;
  isDestructive?: boolean;
  confirmVariant?: string;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title,
  message,
  confirmLabel,
  confirmText,
  isDestructive = true,
  confirmVariant,
  loading = false,
}) => {
  const handleClose = () => {
    if (onCancel) onCancel();
    else if (onClose) onClose();
  };

  const label = confirmText || confirmLabel || 'Confirm';
  const destructive = isDestructive || confirmVariant === 'danger';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} maxWidth="420px">
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', margin: '8px 0 20px 0' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            background: destructive ? 'var(--danger-subtle)' : 'var(--warning-subtle)',
            border: `1px solid ${destructive ? 'var(--danger-border)' : 'var(--warning-border)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <AlertTriangle size={18} color={destructive ? 'var(--danger)' : 'var(--warning)'} />
        </div>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          {message}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button onClick={handleClose} disabled={loading} className="btn btn-secondary btn-sm">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`btn ${destructive ? 'btn-danger' : 'btn-primary'} btn-sm`}
        >
          {loading ? 'Processing...' : label}
        </button>
      </div>
    </Modal>
  );
};

import React from 'react';

export type BadgeVariant =
  | 'active'
  | 'pending'
  | 'inactive'
  | 'info'
  | 'neutral'
  | 'completed'
  | 'danger'
  | 'warning'
  | string;

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  showDot?: boolean;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, showDot = true, style }) => {
  // Normalize string to badge class
  const v = variant.toLowerCase();
  let badgeClass = 'badge-neutral';

  if (v === 'active' || v === 'present' || v === 'approved' || v === 'paid' || v === 'completed' || v === 'acknowledged') {
    badgeClass = 'badge-active';
  } else if (v === 'pending' || v === 'half_day' || v === 'warning') {
    badgeClass = 'badge-pending';
  } else if (v === 'inactive' || v === 'absent' || v === 'rejected' || v === 'cancelled' || v === 'danger') {
    badgeClass = 'badge-inactive';
  } else if (v === 'info' || v === 'late' || v === 'submitted') {
    badgeClass = 'badge-info';
  }

  return (
    <span className={`badge ${badgeClass}`} style={style}>
      {showDot && <span className="badge-dot" />}
      <span>{children}</span>
    </span>
  );
};

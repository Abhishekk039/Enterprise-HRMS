import React from 'react';

export const Skeleton: React.FC<{
  width?: string;
  height?: string;
  borderRadius?: string;
  style?: React.CSSProperties;
}> = ({ width = '100%', height = '16px', borderRadius = 'var(--radius-sm)', style }) => {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 6 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c}>
              <Skeleton height="14px" width={c === 0 ? '70%' : c === 1 ? '90%' : '60%'} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export const SkeletonTableRows: React.FC<{ rows?: number; columns?: number }> = ({ rows = 5, columns = 6 }) => {
  return <TableSkeleton rows={rows} cols={columns} />;
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton width="100px" height="14px" />
        <Skeleton width="32px" height="32px" borderRadius="var(--radius-sm)" />
      </div>
      <Skeleton width="60px" height="28px" />
      <Skeleton width="140px" height="12px" />
    </div>
  );
};

export const SkeletonCard: React.FC<{ lines?: number }> = () => {
  return <CardSkeleton />;
};

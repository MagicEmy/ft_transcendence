// StatItem.tsx
import React from 'react';

interface StatItemProps {
  label: string;
  value: number | undefined;
}

const StatItem = ({ label, value }: StatItemProps) => {
  return (
    <span className="stat">
      <strong>{value}</strong> {label}
    </span>
  );
};

export default StatItem;

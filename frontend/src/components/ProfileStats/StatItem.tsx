// StatItem.tsx
import React from 'react';

interface StatItemProps {
  label: string;
  value: number | undefined;
}

const StatItem = ({ label, value }: StatItemProps) => {
  return value && value > 0 ? <span className="stat"><strong>{value}</strong> {label}</span> : null;
};

export default StatItem;

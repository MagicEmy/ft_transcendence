import React from 'react';
import { useNavigate } from 'react-router-dom';

interface NavigationButtonProps {
  children: React.ReactNode;
  to: string;
  className?: string;
}

export const NavigationButton = ({
  children,
  to,
  className,
}: NavigationButtonProps) => {
  const navigate = useNavigate();
  const onClick = () => {
    navigate(to);
  };

  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
};

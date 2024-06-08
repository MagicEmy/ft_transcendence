import React, { useEffect } from 'react';
import { useNavigate, useLocation, } from 'react-router-dom';
import { isLinkActive } from '../utils/isLinkActive';

interface NavigationButtonProps {
  children: React.ReactNode;
  to: string;
  className?: string;
}
export const NavigationButton = ({ children, to, className }: NavigationButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [navigateTo, setNavigateTo] = React.useState<string | null>(null);

  useEffect(() => {
    if (navigateTo) {
      navigate(navigateTo, { replace: true });
      setNavigateTo(null); // Reset after navigation
    }
  }, [navigateTo, navigate]);
  const onClick = () => {
    setNavigateTo(to);
  };

  const isActive = isLinkActive(location.pathname, to);
  const buttonClassName = `${className || ''} ${isActive ? 'active' : ''}`.trim();

  return (
    <button onClick={onClick} className={buttonClassName}>
      {children}
    </button>
  );
}


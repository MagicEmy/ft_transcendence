import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface NavigateAvatarProps {
  to: string;
  className?: string;

}
export const NavigateAvatar = ({ to, className }: NavigateAvatarProps) => {
  const navigate = useNavigate();
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

  return (
    <button onClick={onClick} className={className}>
    </button>  );
}


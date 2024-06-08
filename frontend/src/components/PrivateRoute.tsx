import React, { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStorage from '../hooks/useStorage';

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const [userIdStorage] = useStorage<string>('userId', '');
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    if (!userIdStorage) {
      console.log('PrivateRoute: No user logged in');
      navigate('/');
    } else {
      setLoading(false);
    }
  }, [userIdStorage, navigate]);

  if (loading) {
    return <div>Loading...</div>; // Replace with your loading spinner or fallback UI
  }

  return <>{children}</>;
};

export default PrivateRoute;

import React, { ReactNode } from 'react';
import { useNavigate } from "react-router-dom";
import useStorage from '../hooks/useStorage';

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const [userIdStorage ] = useStorage<string>('userId', '');
  // const location = useLocation();
  const navigate = useNavigate();

  if (!userIdStorage) {
    console.log("PrivateRoute: No user logged in");
    navigate('/');
    return <></>;
  }

  return <>{children}</>;
};

export default PrivateRoute;

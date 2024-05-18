import React, { useContext } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const PrivateRoute = () => {
  const { userDetails } = useContext(UserContext);
  const location = useLocation();

  if (!userDetails) {
    return <Navigate to="/" state={{ from: location }} />;
  }

  return <Outlet />;
};

export default PrivateRoute;

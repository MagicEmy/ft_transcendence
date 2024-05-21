import React, { useContext } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import  UserContext  from '../context/UserContext';

const PrivateRoute = () => {
  const { userData } = useContext(UserContext);
  const location = useLocation();

  console.log("PrivateRoute: userData", userData);
  if (!userData) {
	console.log("PrivateRoute: No user logged in");
    return <Navigate to="/" state={{ from: location }} />;
  }	

  return <Outlet />;
};

export default PrivateRoute;

import React, { useContext, ReactNode } from 'react';
import { useNavigate } from "react-router-dom";

import UserContext from '../context/UserContext';

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { userIdContext } = useContext(UserContext);
  // const location = useLocation();
  const navigate = useNavigate();

  console.log("PrivateRoute: userData", userIdContext);
  if (!userIdContext) {
    console.log("PrivateRoute: No user logged in");
    navigate('/');
    return <></>;
  }

  return <>{children}</>;
};

export default PrivateRoute;

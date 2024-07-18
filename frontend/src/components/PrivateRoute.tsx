import React, { ReactNode } from 'react';
import { useIsLoggedIn } from '../hooks/useIsLoggedIn';
import PageContent from './PageContent';
import classes from './PageContent.module.css';
import { useNavigate } from "react-router-dom";

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { isLoggedin, loading, error } = useIsLoggedIn();

//   if (loading) {
//     return <div>Loading...</div>; 
//   }

  if (error) {
    console.error('PrivateRoute error:', error);
    return (
      <PageContent title="Error">
        <p className='error'>Error: {error}</p>
        <button
          className={classes.backButton}
          onClick={() => navigate('/')}
        >
          Back to login
        </button>
      </PageContent>
    );
  }

  if (!isLoggedin) {
    console.log('PrivateRoute: No user logged in');
    return (
      <PageContent title="Error">
        <p className='error'>You must be logged in to view this page</p>
        <button
          className={classes.backButton}
          onClick={() => navigate('/')}
        >
          Back to login
        </button>
      </PageContent>
    );
  }

  return <>{children}</>;
};

export default PrivateRoute;

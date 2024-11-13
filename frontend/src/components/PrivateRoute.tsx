import React, { ReactNode } from 'react';
import { useIsLoggedIn } from '../hooks/useIsLoggedIn';
import PageContent from './PageContent';
import classes from './PageContent.module.css';
import { useNavigate } from 'react-router-dom';

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { isLoggedin, loading, error } = useIsLoggedIn();

  if (loading) {
    return (
      <PageContent title="Loading data">
        <p className="content">Loading...</p>
      </PageContent>
    );
  }

  if (error) {
    console.error('PrivateRoute error:', error);
    return (
      <PageContent title="Access Denied - Risk of Wormhole">
        <br />
        <p className="content">
          Your credentials are not authorized to access this parallel universe
        </p>
        <br />
        <button className={classes.backButton} onClick={() => navigate('/')}>
          Navigate Back to Login Galaxy
        </button>
      </PageContent>
    );
  }
  if (!isLoggedin) {
    return (
      <PageContent title="Access Denied - Risk of Wormhole">
        <p className="content">
          Your credentials are not authorized to access this parallel universe
        </p>
        <button className={classes.backButton} onClick={() => navigate('/')}>
          Navigate Back to Login Galaxy
        </button>
      </PageContent>
    );
  }

  return <>{children}</>;
};

export default PrivateRoute;

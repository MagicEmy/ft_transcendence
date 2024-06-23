import React, { ReactNode, useContext } from 'react';
// import UserContext, { IUserContext } from '../context/UserContext';
import { useIsLoggedIn } from '../hooks/useIsLoggedIn';
import PageContent from './PageContent';
import classes from './PageContent.module.css';
import { useNavigate } from "react-router-dom";



const PrivateRoute = ({ children }: { children: ReactNode }) => {
  // const { userIdContext } = useContext<IUserContext>(UserContext);

  const navigate = useNavigate();
  const { isLoggedin } = useIsLoggedIn();

  // if (isLoggedin === false || (!userIdContext && !isLoggedin)) {
  if (isLoggedin === false ) {
    console.log('PrivateRoute: No user logged in');
    const title = 'Error';
    const message = 'You must be logged in to view this page';
    return (
      <>
        <PageContent title={title}>
          <p className='errror'> {message}</p>
          <button className={classes.backButton} onClick={() => {
           navigate('/')
          }}>Back to login</button>
        </PageContent>
      </>
    );
  }

  return <>{children}</>;
};

export default PrivateRoute;

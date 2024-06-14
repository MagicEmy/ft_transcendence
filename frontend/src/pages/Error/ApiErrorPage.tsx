import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarError from './NavbarError';
import classes from '../../components/Navbar/Navbar.module.css';
import PageContent from '../../components/PageContent';

interface ApiErrorPageProps {
  error: {
    message: string;
    statusCode?: number;
  };
}

function ApiErrorPage({ error }: ApiErrorPageProps) {
  const navigate = useNavigate();

  let title = 'Error';
  let message = 'An error occurred';

  if (error) {
    if (error.statusCode === 404) {
      title = 'Resource Not Found';
      message = 'The resource you are looking for does not exist';
    } else if (error.statusCode === 403) {
      title = 'Access Denied';
      message = 'You are not authorized to access this resource';
    } else if (error.statusCode === 500) {
      title = 'Internal Server Error';
      message = 'An internal server error occurred';
    } else {
      message = 'An unknown error occurred';
    }
  }

  return (
    <>
      <NavbarError />
      <PageContent title={title}>
        <p className='error'>{message}</p>
        <button
          className={classes.button}
          onClick={() => {
            navigate('/');
          }}
        >
          Back
        </button>
      </PageContent>
    </>
  );
}

export default ApiErrorPage;

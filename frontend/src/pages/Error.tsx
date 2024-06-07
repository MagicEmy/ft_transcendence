import React from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PageContent from '../components/PageContent';

const Error = () => {
  const error = useRouteError();
  const navigate = useNavigate()
  let title = 'Error';
  let message = 'An unknown error occurred';

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = 'Page Not Found';
      message = 'The page you are looking for does not exist';
    } else if (error.status === 403) {
      title = 'Access Denied';
      message = 'You are not authorized to view this page';
    } else if (error.status === 500) {
      title = 'Internal Server Error';
      message = 'An internal server error occurred';
      try {
        const parsedMessage = JSON.parse(error.data.message).message;
        if (parsedMessage) {
          message = parsedMessage;
        }
      } catch (e) {
        // Handle JSON parsing error if needed
      }
    }
  }

  return (
    <>
      {/* <Navbar /> */}
      <PageContent title={title}>
        <p className='errror'> {message}</p>
        <button onClick={() => {
          navigate('/')
        }}>back</button>
      </PageContent>
    </>
  );
}

export default Error;

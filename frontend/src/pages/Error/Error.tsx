import React from 'react';
import {
  useRouteError,
  isRouteErrorResponse,
  useNavigate,
} from 'react-router-dom';
import NavbarError from './NavbarError';
import PageContent from '../../components/PageContent';

const Error = ({ status }: { status?: number; }) => {
	const routerError = useRouteError();
  const navigate = useNavigate();
  let error = status || routerError;
  let title = 'Error';
  let message = 'An unexpected anomaly occurred in the space-time continuum';

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = 'Error 404 - World Not Found';
      message =
        'The world you are looking for seems to have drifted into the void';
    } else if (error.status === 403 || error.status === 401) {
      title = 'Error 403 - Access Denied risk of Wormhole';
      message =
        'Your credentials are not authorized to access this parallel universe';
    } else if (error.status === 500) {
      title = 'Error 500  - Black Hole Detected';
      message =
        'Something went wrong, and we are working to stabilize the system';
      try {
        const parsedMessage = JSON.parse(error.data.message).message;
        if (parsedMessage) {
          message = parsedMessage;
        }
      } catch (e) {
        console.error('Error parsing error message', e);
      }
    } else {
      title = 'Uncharted Territory';
      message = 'We have encountered an anomaly in the space-time continuum';
    }
  }

  return (
    <>
			{!status && <NavbarError />}
      <PageContent title={title}>
        <p className="errror"> {message}</p>
        <button
          className="button-profile"
          onClick={() => {
            navigate('/');
          }}
        >
          Navigate Back to login galaxy
        </button>
      </PageContent>
    </>
  );
};

export default Error;

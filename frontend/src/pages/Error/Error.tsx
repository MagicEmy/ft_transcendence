import React from 'react';
import {
  useRouteError,
  isRouteErrorResponse,
  useNavigate,
} from 'react-router-dom';
import NavbarError from './NavbarError';
import PageContent from '../../components/PageContent';

interface ErrorProps {
  status?: number;
}

const Error: React.FC<ErrorProps> = ({ status }) => {
  const routerError = useRouteError();
  const navigate = useNavigate();

  let errorStatus = status;
  let errorMessage = '';
			console.log('ErrorStatus before:', errorStatus);

	if (isRouteErrorResponse(routerError)) {
    errorStatus = routerError.status;
		errorMessage = routerError.data?.message || routerError.statusText;
		console.log('errorMessage:', errorMessage);
  } else if (routerError && typeof routerError === 'object' && 'message' in routerError) {
    errorMessage = String(routerError.message);
  } else if (typeof routerError === 'string') {
    errorMessage = routerError;
  } else {
    errorMessage = 'An unknown error occurred';
  }
	console.log('Error:', errorStatus);
  let title = 'Uncharted Territory';
  let message = 'We have encountered an anomaly in the space-time continuum';

  switch (errorStatus) {
    case 400:
      title = 'Cosmic Communication Malfunction';
      message =
        "Your request was lost in translation. The universal translator couldn't decode your space signals";
      break;
    case 401:
    case 403:
      title = 'Access Denied - Risk of Wormhole';
      message =
        'Your credentials are not authorized to access this parallel universe';
      break;
    case 404:
      title = 'World Not Found';
      message =
        'The world you are looking for seems to have drifted into the void';
      break;
    case 500:
      title = 'Black Hole Detected';
      message =
        'Something went wrong, and we are working to stabilize the system';
      if (errorMessage) {
        try {
          const parsedMessage = JSON.parse(errorMessage).message;
          if (parsedMessage) {
            message = parsedMessage;
          }
        } catch (e) {
          console.error('Error parsing error message', e);
        }
      }
      break;
  }

  return (
    <>
      {!status && <NavbarError />}
      <PageContent title={`Error - ${title}`}>
        <p className="error">{message}</p>
				<br />
        <p className="error">To return to safety, use the teleporter below</p>
				<br />
        <button className="button-profile" onClick={() => navigate('/')}>
          Activate Teleporter
        </button>
      </PageContent>
    </>
  );
};

export default Error;

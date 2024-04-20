import Navbar from "../components/Navbar";
import { useRouteError } from "react-router-dom";
import PageContent from '../components/PageContent'

const Error = () => {
  const error = useRouteError();

  let title = "Error";
  let message = "An unknown error occurred";

  if (error.status === 404) {
	title = "Page Not Found";
	message = "The page you are looking for does not exist";
  } else if (error.status === 403) {
	title = "Access Denied";
	message = "You are not authorized to view this page";
  } else if (error.status === 500) {
	title = "Internal Server Error";
	message = "An internal server error occurred";
	message = JSON.parse(error.message).message; 
  }

	return (
    <>
      <Navbar />
      <PageContent title={title}>
        <p>{message}</p>
      </PageContent>
    </>
  );
};

export default Error;

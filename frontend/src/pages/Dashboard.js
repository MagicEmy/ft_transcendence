import React, { useEffect, useContext } from 'react';
import PageContent from '../components/PageContent';
import AuthContext from '../context/AuthContext';

export const Dashboard = () => {
  const { setAuthToken } = useContext(AuthContext);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
		console.log("!!!!token: ", token);
      setAuthToken(token);

      window.history.pushState({}, '', window.location.pathname);
    } else {
      console.error('No token found in URL');
    }
  }, [setAuthToken]);

  return (
    <>
      <PageContent title="Welcome!">
        <br />
        <p>Play or chat</p>
      </PageContent>
    </>
  );
};

export default Dashboard;

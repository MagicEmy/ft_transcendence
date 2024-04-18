import React, { useEffect } from 'react';
import PageContent from '../components/PageContent';
// import AuthContext from '../context/AuthContext';

export const Dashboard = () => {
//   const { setAuthToken } = useContext(AuthContext);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
		console.log("!!!!token: ", token);
    //   setAuthToken(token);

      // Clean the URL without reloading the page to avoid losing state
      window.history.pushState({}, '', window.location.pathname);
    } else {
      console.error('No token found in URL');
      // Handle any necessary logic for when the token is not present
    }
  }, []);

  // const getUser = () => {
  //   fetch('http://localhost:3003/auth/user', {
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: `Bearer ${localStorage.getItem('userID')}`,
  //     },
  //   })
    //   .then((response) => response.json())
    //   .then((data) => {
    //     console.log(data);
    //   });
    // };

    // useEffect(() => {
    //     getUser();
    //   }, []);

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

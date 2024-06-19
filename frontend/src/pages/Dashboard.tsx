import React, { useEffect } from 'react';
import PageContent from '../components/PageContent';
import smash from "../assets/SmashN.png";
import { useSocketContext } from '../context/SocketContext';
import { useIsLoggedIn } from '../hooks/useIsLoggedIn';

export const Dashboard = () => {
	const { socketLogin } = useSocketContext();
	const { isLoggedin } = useIsLoggedIn();


	useEffect(() => {
		if (isLoggedin) {
			socketLogin();
		} else {
			console.log('No user logged in');
		}
	},[isLoggedin]);

  return (
    <>
      <PageContent title="Welcome!">
        <br />
        <p>Hit Play! Chat Away - Pong Awaits!</p>
        <img src={smash} alt="Logo" style={{ marginLeft: '300px', opacity: 0.5 }} />
      </PageContent>
    </>
  );
};

export default Dashboard;

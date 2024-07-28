import PageContent from '../components/PageContent';
import { useEffect, useContext } from 'react';
import smash from "../assets/SmashN.png";
import { updateStatus } from '../utils/profileUtils';
import UserContext, { IUserContext } from '../context/UserContext'

export const Dashboard = () => {
	// const { userIdContext } = useContext<IUserContext>(UserContext);

	// const newStatus = 'online';

	// useEffect(() => {
	// 	const updateUserStatus = async (userIdContext: string, newStatus: string) => {
	// 		updateStatus( userIdContext,  newStatus);
	// 	}
	// 	updateUserStatus(userIdContext, newStatus)
	//   }, []); 

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

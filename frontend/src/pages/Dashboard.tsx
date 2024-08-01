import PageContent from '../components/PageContent';
import { useNewUserStatus } from '../hooks';
import smash from "../assets/SmashN.png";

export const Dashboard = () => {
	useNewUserStatus('online');

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

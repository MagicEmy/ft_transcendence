import PageContent from "../components/PageContent";
import smash from "../assets/DataSunBig.png";
import { useUpdateStatus } from '../hooks';

export const Dashboard = () => {
	useUpdateStatus();

  return (
    <>
      <PageContent title="Welcome in Pong!">
        <br />
        <p>Far out in the uncharted backwaters of the unfashionable end 
			of the Western Spiral Arm of the Galaxy lies a small unregarded orange sun.</p>
		<p>Orbiting this at a distance of roughly ninety-two million miles is the world of a Pong master, the PONGINATOR.</p>
		<p>Play a game or chat away, the Ponginator awaits</p>
        <img
          src={smash}
          alt="Logo"
          style={{
            opacity: 0.2,
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: -1,
          }}
        />
      </PageContent>
    </>
  );
};

export default Dashboard;

import PageContent from '../components/PageContent';
import smash from '../assets/DataSunBig.png';
import { useUpdateStatus } from '../hooks';

export const Dashboard = () => {
  useUpdateStatus();

  return (
    <>
      <PageContent title="Welcome to Pongaris">
        <br />
        <p>
          Far out in the uncharted backwaters of the unfashionable end of the
          Western Spiral Arm of the Galaxy lies a small unregarded orange sun.
        </p>
        <p>
          Orbiting this at a distance of roughly ninety-two million miles is
          Pongaris,
        </p>
        <p> the world of a Pong master: the PONGINATOR </p>
        <img
          src={smash}
          alt="Logo"
          style={{
            opacity: 0.2,
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: -1,
          }}
        />
      </PageContent>
    </>
  );
};

export default Dashboard;

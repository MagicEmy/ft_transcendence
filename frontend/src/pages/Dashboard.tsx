import PageContent from "../components/PageContent";
import { useEffect, useContext } from "react";
import smash from "../assets/DataSunBig.png";
import { updateStatus } from '../utils/profileUtils';
import UserContext, { IUserContext } from '../context/UserContext'

export const Dashboard = () => {

  return (
    <>
      <PageContent title="Welcome!">
        <br />
        <p>Hit Play! Chat Away - Pong Awaits!</p>
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

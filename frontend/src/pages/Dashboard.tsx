import React from 'react';
import PageContent from '../components/PageContent';
import smash from "../assets/SmashN.png";

export const Dashboard = () => {

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

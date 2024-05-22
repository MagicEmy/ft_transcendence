import React from "react";
import { useContext } from "react";
import  UserContext  from "../context/UserContext";
import PageContent from "../components/PageContent";

const Dashboard = () => {
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

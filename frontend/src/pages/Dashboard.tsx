import React from "react";
import { useContext } from "react";
import  UserContext  from "../context/UserContext";
import PageContent from "../components/PageContent";

const Dashboard = () => {
  const { userData } = useContext(UserContext);
  console.log("DashboardUser Details:", userData);
  return (
    <>
      <PageContent title="Welcome!">
        <br />
        <p>Play or chat</p>
        {userData ? (
          <p>User ID: {userData.userId}</p>
        ) : (
          <p>No user logged in</p>
        )}
      </PageContent>
    </>
  );
};

export default Dashboard;

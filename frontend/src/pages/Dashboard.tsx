import React from "react";
import Navbar from "../components/Navbar";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import PageContent from "../components/PageContent";

const Dashboard = () => {
  const { userDetails } = useContext(UserContext);
  console.log("DashboardUser Details:", userDetails);
  return (
    <>
      <PageContent title="Welcome!">
        <br />
        <p>Play or chat</p>
        {userDetails ? (
          <p>User ID: {userDetails.userId}</p>
        ) : (
          <p>No user logged in</p>
        )}
      </PageContent>
    </>
  );
};

export default Dashboard;

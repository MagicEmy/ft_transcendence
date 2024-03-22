import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function DashLayout() {
  return (
    <>
      <Navbar />
	  <main>
      <Outlet />
	  </main>
    </>
  );
}

export default DashLayout;

import { Outlet } from "react-router-dom";
// import MainNavigation from "../components/MainNavigation";
// import Header from "../components/Header";
import AuthHeader from "../components/AuthHeader";


function RootLayout() {
  return (
	<>
	<AuthHeader />
	  {/* <MainNavigation /> */}
	  <main>
	  <Outlet />
	  </main>
	</>
  );
}

export default RootLayout;

/* Outlet = from react-router-dom, it defines where the nested routes should be rendered */
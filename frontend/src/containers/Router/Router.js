import {
	RouterProvider,
	createBrowserRouter
} from "react-router-dom";
import Dashboard from "../../pages/Dashboard";
import DashLayout from "../../components/DashLayout";
import Game from "../../pages/Game";
import Login from "../../pages/Login";
import Error from "../../pages/Error";
import Leaderboard from "../../pages/Leaderboard";
import Profile from "../../pages/Profile";
// import Settings from "../../pages/Settings";
// import useStorage from "../hooks/useStorage";
import PrivateRoute from "../../components/PrivateRoute";
import Unauthorized from "../../components/Unauthorized";
// import ChatPage from "../../pages/ChatPage";
// import ProfileUserId from "../../components/ProfileUserId";


const router = createBrowserRouter([
	{
		path: "/",
		errorElement: <Error />,
		children: [
			{ index: true, element: <Login /> },
			{
				path: "/",
				element: <DashLayout />,
				// element: <PrivateRoute />,
				children: [
					// { path: "unauthorized", element: <Unauthorized />},
					{ path: "dashboard", element: <Dashboard /> },
					{ path: "game", element: <Game /> },
					// // { path: "chat", element: <ChatPage />},
					{ path: "leaderboard", element: <Leaderboard /> },
					{ path: "profile", element: <Profile /> },
					{ path: "profile/:userId", element: <Profile /> },
					// { path: "settings", element: <Settings /> },
				]
			},
		]
	},
]);

function AppRouter() {

	return <RouterProvider router={router} />;
}

export default AppRouter;

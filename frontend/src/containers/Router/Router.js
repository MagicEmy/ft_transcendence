import {
	RouterProvider,
	createBrowserRouter
} from "react-router-dom";
import socketIO from 'socket.io-client';
import Dashboard from "../../pages/Dashboard";
import ProfileUserId from "../../components/ProfileUserId";
import DashLayout from "../../components/DashLayout";
import Game from "../../pages/Game";
import Login from "../../pages/Login";
import ChatPage from "../../pages/ChatPage";
import Error from "../../pages/Error";
import Profile from "../../pages/Profile";
import Leaderboard from "../../pages/Leaderboard";
// import { AuthProvider } from "../../context/AuthProvider";

const socket = socketIO.connect('http://localhost:5000');

const router = createBrowserRouter([
	// {	if not loged in
	// 	path: "/",
	// 	element: <LoginLayout />, ??
	// 	children: [
	// 		{ path: "/", element: <Login /> },
	// 	]
	// }, else if loged in
	{
		path: "/",
		errorElement: <Error />,
		children: [
			{ index: true, element: <Login /> },
			{
				path: "/",
				element: <DashLayout />,
				children: [
					{ path: "dashboard", element: <Dashboard /> },
					{ path: "game", element: <Game />},
					{ path: "chat", element: <ChatPage socket={socket} />},
					{ path: "leaderboard", element: <Leaderboard />},
					{ path: "profile", element: <Profile /> },
					{ path: "profile/:userId", element: <ProfileUserId /> },
				] },
		]
	},
]);
//check again relative path 21 - 334
function App() {
	return <RouterProvider router={router} />;
}

export default App;

/*
http data not encripted, not SecurityPolicyViolationEvent
vs
https
/students - path - resources

REST API
via http verbs
GET POST PUT DELETE PATCH
GET - read
idempotent x safe
GER /{id} -> read elem

POST -> create elem - insert info
non idempotent not safe

PUT - update
idempotent not safe

DELETE - delete
idempotent not safe

PATCH - update
idempotent not safe

test simple call and with query paramenter, cal lwith body how do I passs parameters to the server
*/

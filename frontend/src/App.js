
import { RouterProvider, createBrowserRouter } from "react-router-dom";

// import Events from "./pages/Events";
import EventsPage from "./pages/FetchEvents";
import EventDetail from "./pages/EventDetail";
// import NewEvent from "./pages/NewEvent";
import RootLayout from "./pages/Root";
import EditEvent from "./pages/EditEvent";
import EventsRootLayout from "./pages/EventsRoot";
import ErrorPage from "./pages/Error";
import Chat from "./pages/Chat";
import AuthInputs from './pages/AuthInputs.js';
import Game from './pages/Game.js';

const router = createBrowserRouter([
	{ 
		path: '/', 
		element: <RootLayout />,
		errorElement: <ErrorPage />,
		children: [
			{ 	index: true, 
				element: <AuthInputs /> },
			{ 
				path: 'events', 
				element: <EventsRootLayout />,
				children: [
					// { path: '', element: <Events />},
					// { index: true, element: <Events />}, temporary
					{ index: true, element: <EventsPage /> },
					{ path: ':id', element: <EventDetail /> },
					{ path: 'chat', element: <Chat /> },
					{ path: ':id/edit', element: <EditEvent /> },
					{ path: 'game', element: <Game />},
					{ path: 'chat', element: <Chat />},
				]},
	// { path: '/chat', element: <Chat />},
		]
	},
	{ path: '*', element: <ErrorPage /> }

]);

function App() {	
  	return <RouterProvider router={router} />;
}

export default App;

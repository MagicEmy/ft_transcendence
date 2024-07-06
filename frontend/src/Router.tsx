import { createBrowserRouter, RouteObject } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login/Login";
import TwoFA from "./pages/TwoFA/TwoFA";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile/Profile";
import Leaderboard from "./pages/Leaderboard/Leaderboard";
import Settings from "./pages/Settings/Settings";
import Game from "./pages/Game/Game";
import Error from "./pages/Error/Error";
import ErrorBoundary from "./pages/Error/ErrorBoundary";
import PrivateRoute from "./components/PrivateRoute";
import { UserProvider } from "./context/UserContext";
import { SocketProvider } from "./context/SocketContext";
import Chat from "./pages/Chat/Chat";

const publicRoutes: RouteObject[] = [
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/tfa",
    element: <TwoFA />,
  },
  {
    path: "*",
    element: <Error />,
  },
];

const privateRoutes: RouteObject[] = [
  {
    path: "dashboard",
    element: <Dashboard />,
  },
  {
    path: "profile",
    element: <Profile />,
  },
  {
    path: "profile/:userId",
    element: <Profile />,
  },
  {
    path: "profile/:userId/*",
    element: <Error />,
  },
  {
    path: "leaderboard",
    element: <Leaderboard />,
  },
  {
    path: "settings",
    element: <Settings />,
  },
  {
    path: "game",
    element: <Game />,
  },
  {
    path: "chat",
    element: <Chat />,
  },
  {
    path: "*",
    element: <Error />,
  },
];

const router = createBrowserRouter([
  ...publicRoutes,
  {
    path: "/",
    element: (
      <UserProvider>
        <ErrorBoundary>
          <SocketProvider>
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          </SocketProvider>
        </ErrorBoundary>
      </UserProvider>
    ),
    children: privateRoutes,
  },
]);

export default router;

import { createBrowserRouter, RouteObject } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login/Login';
import TwoFA from './pages/TwoFA/TwoFA';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile/Profile';
import Leaderboard from './pages/Leaderboard/Leaderboard';
import Settings from './pages/Settings/Settings';
import Game from './pages/Game/Game';
import Error from './components/Error/Error';
import PrivateRoute from './components/PrivateRoute';
import { UserProvider } from './context/UserContext';

const publicRoutes: RouteObject[] = [
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/twofa',
    element: <TwoFA />,
  },
  {
    path: '*',
    element: <Error />,
  },
];

const privateRoutes: RouteObject[] = [
  {
    path: 'dashboard',
    element: <Dashboard />,
  },
  {
    path: 'profile',
    element: <Profile />,
    children: [
      {
        path: ':userId',
        element: <Profile />,
      },
      {
        path: '*',
        element: <Error />,
      },
    ],
  },
  {
    path: 'leaderboard',
    element: <Leaderboard />,
  },
  {
    path: 'settings',
    element: <Settings />,
  },
  {
    path: 'game',
    element: <Game />,
  },
  {
    path: '*',
    element: <Error />,
  },
];

const router = createBrowserRouter([
  ...publicRoutes,
  {
    path: '/',
    element: (
      <UserProvider>
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      </UserProvider>
    ),
    children: privateRoutes,
  },
]);

export default router;

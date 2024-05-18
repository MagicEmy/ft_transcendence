import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
// import Game from './pages/Game';
// import Leaderboard from './pages/Leaderboard';
// import Profile from './pages/Profile';
// import Settings from './pages/Settings';
import Error from './pages/Error';
import PrivateRoute from './components/PrivateRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
    errorElement: <Error />,
  },
  {
    path: '/app',
    element: <PrivateRoute />,
    errorElement: <Error />,
    children: [
      {
        path: '/app',
        element: <Layout />,
        children: [
          { path: 'dashboard', element: <Dashboard /> },
        //   { path: 'game', element: <Game /> },
        //   { path: 'leaderboard', element: <Leaderboard /> },
        //   { path: 'profile', element: <Profile /> },
        //   { path: 'profile/:userId', element: <Profile /> },
        //   { path: 'settings', element: <Settings /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Error />,
  },
]);

export default router;

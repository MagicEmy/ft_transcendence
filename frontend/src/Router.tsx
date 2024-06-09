import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile/Profile';
import Leaderboard from './pages/Leaderboard/Leaderboard';
import Settings from './pages/Settings/Settings';
import Game from './pages/Game/Game';
import Error from './pages/Error';
import PrivateRoute from './components/PrivateRoute';
import { UserProvider } from './context/UserContext';


const router = createBrowserRouter([

  {
    path: '/',
    errorElement: <Error />,
    children: [
      { index: true, element: <Login /> },
      // { path: 'tfa', element: <TwoFA /> },
      {
        path: '/',
        element:
          <UserProvider>
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          </UserProvider>
        ,
        children: [
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'profile', element: <Profile /> },
          { path: 'profile/:userId', element: <Profile /> },
          { path: 'leaderboard', element: <Leaderboard /> },
          { path: 'settings', element: <Settings /> },
          { path: 'game', element: <Game /> },
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

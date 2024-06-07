import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './Router';
import { UserProvider } from './context/UserContext';

const App = () => {
  return (
    <RouterProvider router={router} />
  );
};

export default App;

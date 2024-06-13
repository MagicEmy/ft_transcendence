import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './Router';
import ErrorBoundary from './pages/Error/ErrorBoundary';


const App = () => {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
};

export default App;

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';

// Create a root.
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}
const root = ReactDOM.createRoot(rootElement);

// Render your application.
root.render(
  <AuthProvider >
	{/* <UserProvider> */}
	  <App />
	{/* </UserProvider> */}
  </AuthProvider>
);

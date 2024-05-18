import React from 'react';
import logo from '../assets/control-alt-delete-keys.png';
import './style/Login.css';

const Login = () => {
  const handleLogin = async (): Promise<void> => {
    window.location.href = 'http://localhost:3003/auth/42/login';
  };

  return (
    <div className="login-container">
      <main className="login-main">
        <img className="login-img" src={logo} alt="Logo" />
        <button className="login-button" onClick={handleLogin}>
          LOGIN
        </button>
        <div className="loader"></div>
      </main>
    </div>
  );
};

export default Login;

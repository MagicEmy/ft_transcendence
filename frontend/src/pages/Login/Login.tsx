import React from 'react';
import logo from '../../assets/control-alt-delete-keys.png';
import background from '../../assets/SunBall.png';
import { LOGIN_AUTH0 } from '../../utils/constants';
import './Login.css';

const Login = () => {
  const handleLogin = async (): Promise<void> => {
    window.location.href = LOGIN_AUTH0;
  };

  return (
    <div className="login-container">
      <main className="login-main">
        {/* <img className="login-img" src={logo} alt="Logo" /> */}
        <button className="button-login" onClick={handleLogin}>
          LOGIN
        </button>
        {/* <div className="loader"></div> */}
      </main>
    </div>
  );
};
export default Login;
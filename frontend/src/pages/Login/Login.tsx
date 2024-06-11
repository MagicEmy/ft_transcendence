import React, { useEffect, useState } from 'react';
import logo from '../../assets/control-alt-delete-keys.png';
import { LOGIN_AUTH0 } from '../../utils/constants';
import './Login.css';

const Login = () => {
  // const [showError, setShowError] = useState(false)
	// const [errorName, setErrorName] = useState('')

  // useEffect(() => {
  //   const urlParams = new URLSearchParams(window.location.search);
  //   const status = urlParams.get('status');

  //   if (status) {
  //     setErrorName('invalid username or password');
  //     setShowError(true);
  //     window.history.pushState({}, '', window.location.pathname);
  //   }
  // }, []);

  const handleLogin = async (): Promise<void> => {
    window.location.href = LOGIN_AUTH0;
  };

  return (
    <div className="login-container">
       {/* {showError && (
			<div className="error-bar">
			  <p className="errortext">{errorName}</p>
			</div>
		  )} */}
    <main className="login-main">
      <img className="login-img" src={logo} alt="Logo" />
      <button className="button-login" onClick={handleLogin}>
        LOGIN
      </button>
      <div className="loader"></div>
    </main>
  </div>
  );
};

export default Login;

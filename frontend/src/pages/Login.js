import React, { useEffect } from "react";
import logo from "../assets/Atari_Pong.png";
import "./Login.css";

const Login = () => {

  const handleLogin = async () => {
    window.location.href = "http://localhost:3003/auth/42/login";
  };

  useEffect(() => {
	const storedUser = localStorage.getItem('user');
	if(storedUser){
		window.location.href ='http://localhost:3000/dashboard';
	}
  }, []);


  return (
    <>
      <div className="login-container">
        <main className="login-main">
          <img className="login-img" src={logo} alt="Logo" />
          <button className="login-button" onClick={handleLogin}>
            LOGIN
          </button>
          <div className="loader"></div>
        </main>
      </div>
    </>
  );
};

export default Login;

////   "proxy": "http://auth:3000",

//   app.enableCors({
//     origin: ['http://localhost:3000'],
//     credentials: true,
//   });


import React, { useEffect } from "react";
import logo from "../assets/Atari_Pong.png"; // Import the image
import "./Login.css";

const Login = () => {
    const handleLogin= async () =>{
      window.location.href = 'http://localhost:3000/dashboard';
    }

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

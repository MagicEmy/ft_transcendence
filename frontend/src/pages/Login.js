import React from "react";
import logo from "../assets/control-alt-delete-keys.png";
// import logo from "../assets/Atari_Pong.png";
// import smash from "../assets/Smash.png";
import "./Login.css";


const Login = () => {

  const handleLogin = async () => {
    window.location.href = "http://localhost:3003/auth/42/login";
  };

  return (
    <>
      <div className="login-container">
        <main className="login-main">
          <img className="login-img" src={logo} alt="Logo" />
          <button className="login-button" onClick={handleLogin}>
            LOGIN
          </button>
          <div className="loader"></div>
          {/* <img className="imgage" src={smash} alt="Ctr-alt-defeat" /> */}
        </main>
      </div>
    </>
  );
};

export default Login;

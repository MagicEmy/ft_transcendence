import React  from "react";
import logo from "../assets/Atari_Pong.png";
// import background from "../assets/ping-pong-neon.jpg";
import "./Login.css";
// import LoginButton from "../components/auth/LoginButton";


const Login = () => {

  const handleLogin = async () => {
    window.location.href = "http://localhost:3003/auth/42/login";
  };
  

  return (
    <>
      <div className="login-container">
        <main className="login-main">
          <img className="login-img" src={logo} alt="Logo" />
		  {/* <img src={background} alt="background" /> */}
          <button className="login-button" onClick={handleLogin}>
            LOGIN
          </button>
		  {/* <LoginButton /> */}
          <div className="loader"></div>
        </main>
      </div>
    </>
  );
};

export default Login;

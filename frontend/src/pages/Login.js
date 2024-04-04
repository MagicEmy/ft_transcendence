import React from "react";
import logo from "../assets/Atari_Pong.png";
import "./Login.css";


const Login = () => {

  const handleLogin = async () => {
    window.location.href = "http://localhost:3003/auth/42/login";
    // const response = await fetch("http://localhost:3003/auth/42/login", {
    //   method: "GET",
    //   credentials: "include",
    // });
    // if (!response.ok) {
    //   throw new Error("Network response was not ok");
    // }
    // const data = await response.json();
    // console.log(data);
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


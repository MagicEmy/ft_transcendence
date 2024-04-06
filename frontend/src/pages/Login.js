import React, { useEffect } from "react";
import logo from "../assets/Atari_Pong.png";
import "./Login.css";
// import LoginButton from "../components/auth/LoginButton";

const Login = () => {
	// const { authState, setAuthState } = useContext(AuthContext);

  const handleLogin = async () => {
    window.location.href = "http://localhost:3003/auth/42/login";
  };

  useEffect(() => {
	// const storedUser = localStorage.getItem('user');
	// if(storedUser){
    // console.log('User already logged in, user ', storedUser);
		// window.location.href ='http://localhost:3000/dashboard';
	// }
	const fetchData = async () => {
		try {
		const response = await fetch(`http://localhost:3003/auth/profile`, {
			method: 'GET',
			credentials: 'include'
		});
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		const data = await response.json();
		console.log(data);
		// setAuthState(data);
		localStorage.setItem('user', JSON.stringify(data));
		} catch (error) {
		console.error(error);
		}
	};

	fetchData();
  }, []);

  


  return (
    <>
      <div className="login-container">
        <main className="login-main">
          <img className="login-img" src={logo} alt="Logo" />
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

////   "proxy": "http://auth:3000",

//   app.enableCors({
//     origin: ['http://localhost:3000'],
//     credentials: true,
//   });


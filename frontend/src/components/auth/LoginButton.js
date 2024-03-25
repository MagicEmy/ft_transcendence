import React from "react";

const LoginButton = () => {
  const login = async () => {
	const domain = "api.intra.42.fr";
	const clientId = "u-s4t2ud-c930e47af85f92df5ee41b130489a749706790c8aaf72a02e663f9ff27d9c9a0";
	const redirectUri = "http://localhost:3000/";
	const responseType = "code";
	const response = await fetch(
		`https://${domain}/oauth/authorize?` +
		`response_type=${responseType}&` +
		`client_id=${clientId}&` +
		`redirect_uri=${encodeURIComponent(redirectUri)}`, {
			redirect:"manual"
		}
	);
	window.location.replace(response.url);
  };

// domain actual endpoint
  return (
    <button className="Login-button" onClick={() => login()}>
      Login
    </button>
  );
};

export default LoginButton;

//http://localhost:3000/dashboard?error=access_denied&error_description=The+resource+owner+or+authorization+server+denied+the+request.

/*
const Login = () => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
  
	const handleLogin = async () => {
	  try {
		const response = await fetch('/auth/42/login');
		if (!response.ok) {
		  throw new Error('Login request failed');
		}
		const data = await response.json();
		// If login is successful, set isLoggedIn to true
		setIsLoggedIn(true);
		// Store token and user data in local storage
		localStorage.setItem('token', data.token);
		localStorage.setItem('userData', JSON.stringify(data.user));
	  } catch (error) {
		console.error('Login failed:', error);
	  }
	};
});

const handleLogin = async () => {
  try {
    const response = await fetch("/auth/42/login", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Login request failed");
    }

    const data = await response.json();
    console.log(data); // Do something with the response data
  } catch (error) {
    console.error("Error:", error);
  }
};
*/

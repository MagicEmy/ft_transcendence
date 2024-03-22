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
fetch('http://localhost:5000/auth/login', {
  method: 'POST', // or 'GET'
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data), // data is your request payload
})
.then(response => response.json())
.then(data => console.log(data))
.catch((error) => {
  console.error('Error:', error);
});
*/

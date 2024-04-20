import React from "react";
import "./LoginButton.css";

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

  return (
	<body>
    <a href="#" class="neon-loader">
      <span>Click!</span>
    </a>
	</body>
  );
};

{/* <button className="Login-button" onClick={() => login()}>
  Login
</button> */}
export default LoginButton;

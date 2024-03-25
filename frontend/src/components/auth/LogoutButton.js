import React from "react";
import axios from 'axios';

const LogoutButton = ({ className }) => {

//   const userlogout = async () => {
//     const domain = "api.intra.42.fr";
//     const clientId = "u-s4t2ud-c930e47af85f92df5ee41b130489a749706790c8aaf72a02e663f9ff27d9c9a0";
//     const returnTo = "http://localhost:3000";

//     const response = await fetch(
//       `https://${domain}/logout?client_id=${clientId}&returnTo=${returnTo}`,
//       { redirect: "manual" }
//     );

//     console.log(response.url);
//     console.log("isLoggedIn before logout: ", isLoggedIn);
// 	setIsLoggedIn(false);
// 	logout({ user: data.user, token: data.token });
// 	localStorage.clear();
// 	window.location.href="/login"
//     window.location.replace(returnTo);
//   };

	async function userlogout() {
			try{
			await axios.get('http://localhost:3001/auth/logout')
			
			localStorage.clear();
			window.location.href="/"
		}
		catch(error){
			localStorage.clear();
			window.location.href="/"
		}
	}


  return (
    <button className={className} onClick={() => userlogout()}>
      LogoutButton
    </button>
  );
};

export default LogoutButton;

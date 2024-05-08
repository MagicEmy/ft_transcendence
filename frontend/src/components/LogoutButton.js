import React from "react";
import { useNavigate } from "react-router-dom";
import useStorage from "../hooks/useStorage";

const LogoutButton = ({ className }) => {

	const [, setToken] = useStorage('authToken', null)
	const [, setUser] = useStorage('user', null)

	const navigate = useNavigate();

	async function userlogout() {
		try{

			setToken(null);
			setUser(null);
			navigate('/');
		}
		catch(error){
			setToken(null);
			setUser(null);
			navigate('/');
		}
	}



  return (
    <button className={className} onClick={() => userlogout()}>
      LogoutButton
    </button>
  );
};

export default LogoutButton;

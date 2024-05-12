import React from "react";
import { useNavigate } from "react-router-dom";
import useStorage from "../hooks/useStorage";
import axios from "axios";

const LogoutButton = ({ className }) => {
	const [authToken, setToken] = useStorage('authToken', null)
	const [,setUser] = useStorage('user', null)
	const navigate = useNavigate();


	async function userlogout() {
		try {
			await axios.post('http://localhost:3003/auth/logout', {}, {
			headers: {
				Authorization: `Bearer ${authToken}`,
			},
			withCredentials: true,
		});

			setToken(null);
			setUser(null);
			navigate('/');
		}
		catch (error) {
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


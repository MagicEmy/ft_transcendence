import React from "react";
import { useNavigate } from "react-router-dom";
import useStorage from "../hooks/useStorage";
import axios from "axios";

const LogoutButton = ({ className }) => {
	const [authToken, , removeToken] = useStorage('authToken', null)
	const [user, , removeUser] = useStorage('user', null)
	const [, , removeAvatar] = useStorage("avatar", null);
	const navigate = useNavigate();


	async function userlogout() {
		try {
			console.log('Logging out user:', user.userId);
			console.log('Logging out authToken:', authToken);
			await axios.post('http://localhost:3003/auth/logout', {
				user_id: user.userId,
			}, {
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
				withCredentials: true,
			});
			console.log('User logged out');
			removeToken();
			removeUser();
			removeAvatar();
			navigate('/');
		}
		catch (error) {
			console.log('Error logging out:', error);
			removeToken();
			removeUser();
			removeAvatar();
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


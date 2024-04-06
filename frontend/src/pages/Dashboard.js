import axios from 'axios';
import React, { useContext, useState, useEffect } from 'react';
import AuthContext from './AuthContext';
import PageContent from '../components/PageContent';

//make this global
const instance = axios.create({
	baseURL: 'http://localhost:3001/auth/42/redirect', // Replace with your actual backend URL
});

export const Dashboard = () => {
	// const authToken = Cookies.get('access_token');
	// console.log("AUTH TOKEN", authToken);
	const [authToken, setAuthToken] = useState(null);

	useEffect(() => {
		const fetchToken = async () => {
			try {
				const response = await instance.get(`${instance.defaults.baseURL}`);
				const data = response.data;
				setAuthToken(data.access_token);
			} catch (error) {
				console.error('Error fetching token:', error);
			}
		};

		fetchToken();
	}, []);

	console.log("AUTH TOKEN", authToken); // Access the fetched token

	return (
		<>

			<PageContent title="Welcome!">
				<br />
				<p>Play or chat</p>
			</PageContent>

		</>
	);
}

export default Dashboard

/*

	Make sure your backend serves the redirect over HTTPS to ensure secure communication.
	Consider storing the JWT token in local storage with an appropriate expiration time instead of keeping it in memory throughout the session.
	Explore secure storage mechanisms provided by your frontend framework/library for enhanced security.

*/

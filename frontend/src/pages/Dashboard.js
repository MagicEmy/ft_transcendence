import React, { useContext, useEffect } from 'react';
import PageContent from '../components/PageContent';
import { UserContext } from '../context/UserProvider';

function Dashboard() {

	const { user, setUser } = useContext(UserContext);

	useEffect(() => {
	const fetchData = async () => {
		try {
		const response = await fetch(`http://localhost:3002/profile`, {
			method: 'GET',
			credentials: 'include'
		});
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		const data = await response.json();
		setUser(data);
		localStorage.setItem('user', JSON.stringify(data));
		console.log("LOcAL STOR", localStorage.getItem('user'));
		} catch (error) {
		console.error(error);
		}
	};

	fetchData();
	}, [user, setUser]);

	return (
		<>

		<PageContent title="Welcome!">
			<br/>
		  <p>Play or chat</p>
		</PageContent>

		</>
	  );
}

export default Dashboard


import React, { useContext, useEffect } from 'react';
import mockUserData from '../data/mockUserData'; // Import mock data
import { UserContext } from '../context/UserContext';
import './ProfileUserId.css';


function ProfileUserId() {

	const { user, setUser } = useContext(UserContext);

	useEffect(() => {
	  const fetchData = async () => {
		try {
		  // Emulate fetching data with a delay to mimic network request
		  await new Promise(resolve => setTimeout(resolve, 1000));
		  // Set user data with mockUserData
		  setUser(mockUserData);
		  // Optional: Save data to localStorage
		  localStorage.setItem('user', JSON.stringify(mockUserData));
		} catch (error) {
		  console.error(error);
		}
	  };

	  fetchData();
	}, [setUser]);


	return (
	  <>
	  {user && (
		<section className="user-info">
		<h4 className="UserName">Name: {user.userName}</h4>
		<br />
		<p className="Userid">User ID: {user.id}</p>
		<p className="UserEmail">e-mail: {user.email}</p>
	  </section>
	  )}
	  </>
	);
  }

export default ProfileUserId

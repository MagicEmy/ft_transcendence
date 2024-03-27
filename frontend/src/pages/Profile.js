import React, { useState } from 'react';
// import { NavLink } from "react-router-dom";
import './Profile.css';

function Profile() {
  const [jsonString, setJsonString] = useState('');

    async function FetchSelf() {
      try {
        const response = await fetch("http://localhost:3002/profile", {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        const jsonString = JSON.stringify(data);
        setJsonString(jsonString);
      } catch (error) {
        console.error('Error:', error);
      }

	  console.log(jsonString);
    }



  return (
    <>
	 <div className="profile-container">
      <div className="profile-details">
          {/* <NavLink
            to="/profile/:userId" // Make sure to replace ":userId" with the actual user ID
            className="nav-link" // Apply the nav-link class
            activeClassName="active" // Apply the active class when the NavLink is active
          >
            User Profile
          </NavLink> */}
          <button className="profile-button" onClick={FetchSelf}>
            Fetch User
          </button>
		</div>
    </div>
	</>
  );
}

export default Profile;

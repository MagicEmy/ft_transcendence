import React, { useState } from 'react';
import './Profile.css';

function Profile() {
  const [jsonString, setJsonString] = useState('');

    async function FetchSelf() {
      try {
		const response = await axios.get(`http://localhost:3002/user/${user.intraId}`);
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
          <button className="profile-button" onClick={FetchSelf}>
            Fetch User
          </button>
		</div>
    </div>
	</>
  );
}

export default Profile;

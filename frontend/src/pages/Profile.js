import React, { useEffect, useState, useContext } from "react";
import useStorage from "../hooks/useStorage";
import AuthContext from '../context/AuthContext'
import axios from "axios";
import "./Profile.css";

function Profile() {
//   const [jsonString, setJsonString] = useState("");
  //const { userProfile, isLoading } = useContext(UserContext);
  const {authToken} = useContext(AuthContext);
  const [ userProfile ] = useStorage('user');
  const [ profile, setProfile ] = useState({});

  console.log('userProfile', Object.entries(userProfile));

  useEffect(() => {		
	if (authToken) {
		//console.log("USERCONTEXT storedToken: ", storedToken);
		//console.log("USERCONTEXT authToken: ", authToken);
		const fetcDbProfile = async () => {
		  try {
			const response = await axios.get('http://localhost:3003/auth/profile', {
				  headers: { Authorization: `Bearer ${authToken}` },
				});
			const dbProfile = response.data;
			setProfile(dbProfile)
			console.log("HERE dbProfile: ", dbProfile);
			console.log('OBJECT', Object.entries(dbProfile));
		  } catch (error) {
			console.error('Error fetching user data:', error);
		  }
		};
		fetcDbProfile();
	  } else {
		console.log('No user_id');
	  }
  }, []);

  return (
    <div className="profile-container">
      <div>
        {Object.entries(profile).map(([key, value]) => (
          <div>
            {key}: {value}
          </div>
        ))}
      </div>
      {/* <div>
        {JSON.stringify(userProfile)}
      </div> */}
      <div className="profile-details">
        intra_login: {profile.intra_login}
        user_name: {profile.user_name}
        avatar: {profile.avatar}
      </div>
    </div>
  );
}

export default Profile;

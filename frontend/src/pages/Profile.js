import React, { useEffect, useState, useContext } from "react";
import useStorage from "../hooks/useStorage";
import AuthContext from '../context/AuthContext'
import axios from "axios";
import "./Profile.css";
import Modal from "../components/Modal";

function Profile() {
//   const [jsonString, setJsonString] = useState("");
  //const { userProfile, isLoading } = useContext(UserContext);
  const {authToken} = useContext(AuthContext);
  const [ userProfile ] = useStorage('user');
  const [ profile, setProfile ] = useState();

  console.log('userProfile', Object.entries(userProfile));

  useEffect(() => {		
	if (authToken) {
		//console.log("USERCONTEXT storedToken: ", storedToken);
		//console.log("USERCONTEXT authToken: ", authToken);
		const fetcDbProfile = async () => {
		  try {
			const response = await axios.get('http://localhost:3002/profile/'+userProfile.user_id, {
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

  const [isFriendModalOpen, setIsFriendModalOpen] = useState(false);
  const [friend, setFriend] = useState();
  const openFriendProfile = (friend) => {
	setIsFriendModalOpen(true);
	setFriend(friend);
  };

  return (
    <div className="profile-container">
		<div>
			<avatar>
				<img src={profile && profile.avatar} alt="avatar" />
			</avatar>
			<span>{profile?.user_name}</span>
		</div>
		{profile && profile.friends.map((friend) => (			
			<div key={friend.user_id} className="friends-sidebar">
				<div onClick={()=>openFriendProfile(friend)}>{friend.user_name}</div>
			</div>
		))}

		{friend && 
			<>
				<Modal isOpen={isFriendModalOpen}
					setIsOpen={(v) => setIsFriendModalOpen(v)}
					title={`Profile of ${friend.user_name}`}>
					<div>
						Username: {friend.user_name}
					</div>
				</Modal>
			</>
		}
    </div>
  );
}

export default Profile;

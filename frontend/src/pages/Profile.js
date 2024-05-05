import React, { useEffect, useState, useContext } from "react";
import useStorage from "../hooks/useStorage";
import "./Profile.css";
import { useParams, Link, NavLink } from "react-router-dom";
import { loadProfile } from "../libs/profile";
import AuthContext from "../context/AuthContext";
import UserContext from "../context/UserContext";

function Profile() {
  const { userId } = useParams("userId");
  console.log(userId);

  const [userProfile] = useStorage("user");
  const [profile, setProfile] = useState();

  const { authToken } = useContext(AuthContext);
  // const { userProfile } = useContext(UserContext);

  useEffect(() => {
    const fetcDbProfile = async () => {
      try {
        const userIdOrMe = userId || userProfile.user_id;
        const dbProfile = await loadProfile(authToken, userIdOrMe);
        setProfile(dbProfile);
        console.log("HERE dbProfile: ", dbProfile);
        console.log("OBJECT", Object.entries(dbProfile));
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetcDbProfile();
  }, [userId]);

  const [friend, setFriend] = useState();

  return (
	<div className="profile">		
	  <div className="profile-container">
		<div className="item">
			<avatar>
			<img src={profile && profile.avatar} />
			</avatar>
			<span>{profile?.user_name}</span>
		</div>
	    <div className="stats-container">

		</div>
      </div>
	  {
		!userId && (
			<aside className="friends">
				{profile &&
					profile.friends.map((friend) => (
					<div key={friend.user_id}>
						<NavLink to={`/profile/${friend.user_id}`}>{friend.user_name}</NavLink>
					</div>
					))}
			</aside>
		)
	  }
	</div>
  );
}

export default Profile;

// <img src={profile && profile.avatar} alt="avatar" />

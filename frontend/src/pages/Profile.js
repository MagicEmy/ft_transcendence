import React, { useEffect, useState, useContext } from "react";
import useStorage from "../hooks/useStorage";
import AuthContext from "../context/AuthContext";
import axios from "axios";
import "./Profile.css";
import { useParams, Link } from "react-router-dom";

function Profile() {
  const { userId } = useParams("userId");
  const { authToken } = useContext(AuthContext);
  const [userProfile] = useStorage("user");
  const [profile, setProfile] = useState();

  useEffect(() => {
    if (authToken) {
      const fetcDbProfile = async () => {
        try {
          const userIdOrMe = userId || userProfile.user_id;
          const response = await axios.get(
            `http://localhost:3002/profile/${userIdOrMe}`,
            {
              headers: { Authorization: `Bearer ${authToken}` },
            }
          );
          const dbProfile = response.data;
          setProfile(dbProfile);
          console.log("HERE dbProfile: ", dbProfile);
          console.log("OBJECT", Object.entries(dbProfile));
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetcDbProfile();
    } else {
      console.log("No user_id");
    }
  }, [userId]);

  const [friend, setFriend] = useState();

  return (
    <div className="profile-container">
      <div className="item">
        <avatar>
          <img src={profile && profile.avatar} />
        </avatar>
        <span>{profile?.user_name}</span>
      </div>
      {profile &&
        profile.friends.map((friend) => (
          <div key={friend.user_id} className="friends-sidebar">
            <Link to={`/profile/${friend.id}`} >
              {friend.user_name}
            </Link>
          </div>
        ))}
    </div>
  );
}

export default Profile;

// <img src={profile && profile.avatar} alt="avatar" />
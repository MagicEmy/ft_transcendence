import React, { useEffect, useState, useContext } from "react";
import useStorage from "../hooks/useStorage";
import "./Profile.css";
import { useParams, NavLink } from "react-router-dom";
import { loadProfile, loadProfileAvatar } from "../libs/profileData";
import AuthContext from "../context/AuthContext";

function Profile() {
  const { userId } = useParams("userId");

  const [userProfile] = useStorage("user");
  const [profile, setProfile] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const { authToken } = useContext(AuthContext);
  // const { userProfile } = useContext(UserContext);

  useEffect(() => {
    const fetcDbProfile = async () => {
      try {
        const userIdOrMe = userId || userProfile.user_id;
        const dbProfile = await loadProfile(authToken, userIdOrMe);
        setProfile(dbProfile);
        // console.log("HERE dbProfile: ", dbProfile);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetcDbProfile();
  }, [userId, authToken, userProfile.user_id]);

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const userIdOrMe = userId || userProfile.user_id;
        const imageUrl = await loadProfileAvatar(authToken, userIdOrMe);
        setAvatarUrl(imageUrl);
      } catch (error) {
        console.error('Error fetching avatar:', error.message); // Adjusted to log error.message
      }
    };

    fetchAvatar();
    return () => {
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [userId, authToken, userProfile.user_id, avatarUrl]);

  return (
    <div className="userProfile">
      <div className="flex">
        <div className="item">
          {avatarUrl ? <img src={avatarUrl} alt="User Avatar" /> : <p>Loading...</p>}
        </div>
        <div className="item">
        <div className="info">
          <h3 className='name text-dark'>{profile.user_name}</h3>
          {/* <span className="total-points">Total points: {profile.}</span>
          <div className="stats">
            <span className="stat">Wins: <strong>{value.wins}</strong></span>
            <span className="stat">Losses: <strong>{value.losses}</strong></span>
            <span className="stat">Draws: <strong>{value.draws}</strong></span>
          </div> */}
          </div>

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
	</div >
  );
}

export default Profile;

// <img src={profile && profile.avatar} alt="avatar" />

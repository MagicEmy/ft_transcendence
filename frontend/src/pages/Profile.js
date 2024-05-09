import React, { useEffect, useState, useContext } from "react";
import { useParams, NavLink } from "react-router-dom";
import { loadProfile, loadProfileAvatar } from "../libs/profileData";
import useStorage from "../hooks/useStorage";
import "./Profile.css";
import classes from "./Profile.css";
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
        console.log("HERE dbProfile: ", dbProfile);
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
        const imageUrl = await loadProfileAvatar(userIdOrMe);
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
  }, [userId, , userProfile.user_id, avatarUrl]);

  return (
    <div className="main">
      <div className="profile">
        <div className="flex">
          <div className="item">
            {avatarUrl ? <img src={avatarUrl} alt="User Avatar" /> : <p>Loading...</p>}
          </div>
          <div className="item">
            <div className="info">
              <h3 className='name text-dark'>{profile?.user_info?.user_name}</h3>
              <div className="stats">
                <span className="stat">leaderboard_position: <strong>{profile?.leaderboard_position}</strong></span>
                <span className="stat">total_players <strong>{profile.total_players}</strong></span>
                <h3 className='name text-dark'>Opponents</h3>
                  <span className="stat">most_frequent_opponent <strong>{profile?.most_frequent_opponent[0]?.user_name}</strong></span>   {/*change to array! */}
                {/* <NavLink
                  to={`/profile/${profile?.most_frequent_opponent[0]?.user_id}`} className={({ isActive }) =>
                    isActive ? classes.active : undefined} >
                  <h3 className='name text-dark'><strong>{profile?.most_frequent_opponent[0]?.user_name}</strong></h3>
                </NavLink> */}
                <h3 className='name text-dark'>games_against_bot</h3>
                <span className="stat">total_played_games <strong>{profile?.games_against_bot?.total_played_games}</strong></span>
                <span className="stat">max_score <strong>{profile?.games_against_bot?.max_score}</strong></span>
                <span className="stat">Wins: <strong>{profile?.games_against_bot?.wins}</strong></span>
                <span className="stat">Draws: <strong>{profile?.games_against_bot?.draws}</strong></span>
                <span className="stat">Losses: <strong>{profile?.games_against_bot?.losses}</strong></span>
              </div>
            </div>
          </div>
        </div>
        {profile && (
          <aside className="friends">
            {profile &&
              profile.friends.map((friend) => (
                <div key={friend.user_id}>
                  <NavLink to={`/profile/${friend.user_id}`}>{friend.user_name}</NavLink>
                </div>
              ))}
          </aside>
        )}
      </div >
    </div>
  );
}

export default Profile;

// <img src={profile && profile.avatar} alt="avatar" />

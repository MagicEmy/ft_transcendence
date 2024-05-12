import React, { useEffect, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import { loadProfile, loadProfileAvatar } from "../libs/profileData";
import { loadFriends, addFriend, deleteFriend } from "../libs/friends";
import useStorage from "../hooks/useStorage";
import "./Profile.css";
// import classes from "./Profile.css";

function Profile() {
  const { userId } = useParams("userId");

  const [userProfile] = useStorage("user");
  const [profile, setProfile] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [friends, setFriends] = useState([]);
  const status = "Online";

  useEffect(() => {
    const fetcDbProfile = async () => {
      try {
        const userIdOrMe = userId || userProfile.user_id;
        const dbProfile = await loadProfile(userIdOrMe);
        setProfile(dbProfile);
        console.log("HERE dbProfile: ", dbProfile);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetcDbProfile();
    console.log("So now? profile: ", profile?.user_id);

  }, [userId, userProfile.user_id]);

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const userIdOrMe = userId || userProfile.user_id;
        const imageUrl = await loadProfileAvatar(userIdOrMe);
        setAvatarUrl(imageUrl);
      } catch (error) {
        console.error('Error fetching avatar:', error.message);
      }
    };

    fetchAvatar();
    // return () => {
    //   if (avatarUrl) {
    //     URL.revokeObjectURL(avatarUrl);
    //   }
    // };
  }, [userId, userProfile.user_id]);

  useEffect(() => {
    const fetcFriends = async () => {
      try {
        const userIdOrMe = userId || userProfile.user_id;
        const profileFriends = await loadFriends(userIdOrMe);
        setFriends(profileFriends);
        console.log("friends: ", profileFriends);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetcFriends();
  }, [userId, userProfile.user_id]);

  const handleFriendClick = async () => {
    if (isFriend) {
      console.log("Delete friend:", userId);
      await deleteFriend(userProfile.user_id, userId);
    } else {
      console.log("Add friend:", userId);
      await addFriend(userProfile.user_id, userId);
    }
    // Refresh friend list or set state to update UI
  };

  
  const isFriend = friends?.includes(userId);
  console.log("isFriend: ", isFriend);
  console.log("profile.user_id  : ", userId);
  console.log("userProfile.user_id : ", userProfile.user_id);

  return (
    <div className="main">
      <div className="profile">
        <div className="flex">
          <div className="item">
            {avatarUrl ? <img src={avatarUrl} alt="User Avatar" /> : <p>Loading...</p>}
            <h3 className='name text-dark'>{profile?.user_info?.user_name}</h3>
            <div className="item">
              <span className={`status-indicator ${status === 'Online' ? 'online' : 'offline'}`}></span>
              {status}
            </div>
            <div >
              {userId !== userProfile.user_id && (
                <button onClick={handleFriendClick}>
                  {isFriend ? 'Delete Friend' : 'Add Friend'}
                </button>
              )}
            </div>
          </div>
          <div className="item">
            <div className="info">
              <div className="stats">
                <h3 className='name text-dark'>Leaderboard position: <span className="stat"><strong>{profile?.leaderboard_position}</strong></span></h3>
                <span className="stat">Total players <strong>{profile.total_players}</strong></span>
                <h3 className='name text-dark'>Opponents</h3>
                {profile && profile.most_frequent_opponent.map((opponent) => (
                  <div key={opponent.user_name}>
                    <div className="stat">Most frequent opponent: </div>
                    <NavLink to={`/profile/${opponent.user_id}`}>{opponent.user_name}</NavLink>
                  </div>
                ))}
                <h3 className='name text-dark'>Games Against players</h3>
                <span className="stat">Total played games <strong>{profile?.games_against_human?.total_played_games}</strong></span>
                <span className="stat">max_score <strong>{profile?.games_against_human?.max_score}</strong></span>
                <span className="stat">Wins: <strong>{profile?.games_against_human?.wins}</strong></span>
                <span className="stat">Draws: <strong>{profile?.games_against_human?.draws}</strong></span>
                <span className="stat">Losses: <strong>{profile?.games_against_human?.losses}</strong></span>
                <h4 className='name text-dark'>Total time played against players</h4>
                <span className="stat">Weeks <strong>{profile?.games_against_human?.total_time_played?.weeks}</strong></span>
                <span className="stat">Days <strong>{profile?.games_against_human?.total_time_played?.days}</strong></span>
                <span className="stat">Hours: <strong>{profile?.games_against_human?.total_time_played?.hours}</strong></span>
                <span className="stat">Minutes: <strong>{profile?.games_against_human?.total_time_played?.minutes}</strong></span>
                <span className="stat">Seconds: <strong>{profile?.games_against_human?.total_time_played?.seconds}</strong></span>
                <h3 className='name text-dark'>Games Against bot</h3>
                <span className="stat">total_played_games <strong>{profile?.games_against_bot?.total_played_games}</strong></span>
                <span className="stat">max_score <strong>{profile?.games_against_bot?.max_score}</strong></span>
                <span className="stat">Wins: <strong>{profile?.games_against_bot?.wins}</strong></span>
                <span className="stat">Draws: <strong>{profile?.games_against_bot?.draws}</strong></span>
                <span className="stat">Losses: <strong>{profile?.games_against_bot?.losses}</strong></span>
                <h4 className='name text-dark'>Total time played against bot</h4>
                <span className="stat">Weeks <strong>{profile?.games_against_bot?.total_time_played?.weeks}</strong></span>
                <span className="stat">Days <strong>{profile?.games_against_bot?.total_time_played?.days}</strong></span>
                <span className="stat">Hours: <strong>{profile?.games_against_bot?.total_time_played?.hours}</strong></span>
                <span className="stat">Minutes: <strong>{profile?.games_against_bot?.total_time_played?.minutes}</strong></span>
                <span className="stat">Seconds: <strong>{profile?.games_against_bot?.total_time_played?.seconds}</strong></span>
              </div>
            </div>
          </div>
        </div>
        {friends && friends.length > 0 ? (
          <div className="friend-link">
            {friends.map((friends, index) => (
              <div key={`${friends}-${index}`}>
                <NavLink to={`/profile/${friends}`} className={({ isActive }) =>
                  isActive ? "active" : undefined
                }>
                  <strong>{friends}</strong>
                </NavLink>
              </div>
            ))}
          </div>
        ) : (
          <aside className="friends">No friends to display.</aside>
        )}


      </div >
    </div>
  );
}

export default Profile;

// <img src={profile && profile.avatar} alt="avatar" />

/*change name
change avatar
add friends
remove friends
display status
*/

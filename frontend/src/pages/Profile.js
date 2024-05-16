import React, { useEffect, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import { loadProfile, loadProfileAvatar } from "../libs/profileData";
import { loadFriends, addFriend, deleteFriend } from "../libs/friends";
import useStorage from "../hooks/useStorage";
import "./Profile.css";

function Profile() {
  const { userId } = useParams("userId");

  const [userProfile] = useStorage("user");
  const [profile, setProfile] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [error, setError] = useState('');
  const status = "Online";

  useEffect(() => {
    const userIdOrMe = userId || userProfile.user_id;
    if (!userIdOrMe) {
      setError('No user ID found');
      return;
    }
    setLoading(true);
    const fetchDbProfile = async () => {
      try {
        const dbProfile = await loadProfile(userIdOrMe);
        setProfile(dbProfile);
      } catch (error) {
        setError('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };
    fetchDbProfile();
  }, [userId, userProfile.user_id]);

  useEffect(() => {
    const userIdOrMe = userId || userProfile.user_id;
    setAvatarLoading(true);
    const fetchAvatar = async () => {
      try {
        const imageUrl = await loadProfileAvatar(userIdOrMe);
        setAvatarUrl(imageUrl);
      } catch (error) {
        console.error('Error fetching avatar:', error.message);
      } finally {
        setAvatarLoading(false);
      }
    };
    fetchAvatar();
  }, [userId, userProfile.user_id]);

  useEffect(() => {
    const userIdOrMe = userId || userProfile.user_id;
    setFriendsLoading(true);
    const fetchFriends = async () => {
      try {
        const profileFriends = await loadFriends(userIdOrMe);
        setFriends(profileFriends);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setFriendsLoading(false);
      }
    };
    fetchFriends();
  }, [userId, userProfile.user_id]);

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

const handleFriendClick = async () => {
  if (isFriend) {
    console.log("Delete friend:", userId);
    await deleteFriend(userProfile.user_id, userId);
  } else {
    console.log("Add friend:", userId);
    await addFriend(userProfile.user_id, userId);
  }
};

const isFriend = friends?.includes(userId);
console.log("isFriend: ", isFriend);
console.log("profile.user_id  : ", userId);
console.log("userProfile.user_id : ", userProfile.user_id);
/*

  @Get('/:id/status')
  getUserStatus(@Param('id') user_id: string) {
    return this.userService.getUserStatus(user_id);
  }
  */

return (
  <div className="main">
    <div className="profile">
      <div className="flex">
        <div className="item">
        {avatarLoading ? <p>Loading avatar...</p> : <img src={avatarUrl} alt="User avatar" />}
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
      {friendsLoading ? <p>Loading friends...</p> : <h4 className='name text-dark'>Friends</h4>}
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

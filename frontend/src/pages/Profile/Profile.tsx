import React, { useContext, useEffect, useState, useMemo } from "react";
import { useParams, NavLink } from "react-router-dom";
import UserContext from "../../context/UserContext";
import { loadProfile, loadStatus, loadProfileAvatar } from "../../utils/profileUtils";
import { loadFriends, addFriend, deleteFriend } from "../../utils/friendsUtils";
import classes from './Profile.css';

interface ProfileData {
  leaderboard_position?: number;
  total_players?: number;
  most_frequent_opponent?: Array<{ user_name: string; user_id: string }>;
  games_against_human?: GamesData;
  games_against_bot?: GamesData;
  user_name?: string;
}

interface GamesData {
  total_played_games?: number;
  max_score?: number;
  wins?: number;
  draws?: number;
  losses?: number;
  total_time_played?: TimePlayed;
}

interface TimePlayed {
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

interface Friend {
  user_id: string;
  user_name: string;
  status: string;
}

function Profile() {
  const { userId } = useParams<{ userId?: string }>(); // Typing useParams
  const { userIdContext, userNameContext } = useContext<IUserContext>(UserContext);

  const userIdOrMe = useMemo(() => userId || userIdContext, [userId, userIdContext]);

  const [profile, setProfile] = useState<ProfileData>({});
  const [userStatus, setUserStatus] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [avatarLoading, setAvatarLoading] = useState<boolean>(false);
  const [friendsLoading, setFriendsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!userIdOrMe) {
      setError('No user ID found');
      return;
    }

    const fetchProfileAndStatus = async () => {
      try {
        const profile = await loadProfile(userIdOrMe);
        const response = await loadStatus(userIdOrMe);
        setProfile(profile);
        setUserStatus(response.status);
      } catch (error) {
        setError('Failed to fetch profile');
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfileAndStatus();
  }, [userIdOrMe]);

  useEffect(() => {
    if (!userIdOrMe) return;
    setAvatarLoading(true);
    const fetchAvatar = async () => {
      try {
        const imageUrl = await loadProfileAvatar(userIdOrMe);
        setAvatarUrl(imageUrl);
      } catch (error) {
        console.error('Error fetching avatar:', error);
      } finally {
        setAvatarLoading(false);
      }
    };

    fetchAvatar();
  }, [userIdOrMe]);

  useEffect(() => {
    if (!userIdOrMe) return;
    setFriendsLoading(true);
    const fetchFriends = async () => {
      try {
        const profileFriends = await loadFriends(userIdOrMe);
        setFriends(profileFriends || []);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setFriendsLoading(false);
      }
    };

    fetchFriends();
  }, [userIdOrMe]);

  const handleFriendClick = async () => {
    const isFriend = friends.some(f => f.user_id === userId);
    if (isFriend) {
      console.log("Delete friend:", userId);
      await deleteFriend(userIdContext, userId as string);
    } else {
      console.log("Add friend:", userId);
      await addFriend(userIdContext, userId as string);
    }
  };

  const isFriend = friends.some(f => f.user_id === userId);

  const userStatusIndicator = userStatus;

  return (
    <div className="main">
      <div className="profile">
        <div className="flex">
          <div className="item">
            {avatarLoading ? <p>Loading avatar...</p> : <img src={avatarUrl} alt="User avatar" />}
            <h3 className='name text-dark'>{userNameContext}</h3>
            <div className="item">
              <span className={`status-indicator ${userStatusIndicator}`}></span>
              <span>{userStatusIndicator}</span>
            </div>
            <div >
              {userId !== userIdContext && (
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
                {profile && profile.most_frequent_opponent?.map((opponent) => (
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
       < div className="flex">
        <div className="item">
        {friendsLoading ? <p>Loading friends...</p> : <h4 className='name text-dark'>Friends</h4>}
		<br />
		
        {friends && friends.length > 0 ? (
          <div className="friend-link">
            <ul>
              {friends.map((friend) => (
                <li key={friend.user_id}>
                  <NavLink to="/profile/{friend.user_id}"
                    className={({ isActive }) =>
                      isActive ? classes.active : undefined}>
                    {friend.user_name} - Currently:  {friend.status}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div >
          ) : <p>No friends to display.</p>}
         </div>
		 <div>
            <h1>Profile: {profile?.user_name}</h1>
            <h2>Friends</h2>
            {friends && friends.length > 0 ? (
                <ul>
                    {friends.map((friend) => (
                        <li key={friend.user_id}>
                            {friend.user_name} - {friend.status}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No friends to display.</p>
            )}
        </div>
      </div>
    </div>
  </div>
  );
}

      export default Profile;
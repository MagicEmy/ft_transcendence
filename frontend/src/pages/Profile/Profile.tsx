// src/components/Profile/Profile.tsx

import React, { useEffect, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import { loadProfile, loadStatus, loadProfileAvatar } from "../../utils/profileData";
import { loadFriends, addFriend, deleteFriend } from "../../utils/friends";
import useStorage from "../../hooks/useStorage";
import { UserProfile, Friends } from "../../types/shared";
import { ProfileState } from "./Profile.types";
import "./Profile.css";

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();

  const [userProfile,  ] = useStorage<{ user_id: string }>("user", { user_id: "" });
  const [state, setState] = useState<ProfileState>({
    profile: null,
    status: '',
    avatarUrl: '',
    friends: [],
    loading: false,
    avatarLoading: false,
    friendsLoading: false,
    error: ''
  });
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>('');
  const [friends, setFriends] = useState<Friends[] | undefined>([]);

  useEffect(() => {
    const userIdOrMe = userId || userProfile.user_id;
    if (!userIdOrMe) {
      setState((prev) => ({ ...prev, error: 'No user ID found' }));
      return;
    }
    setState((prev) => ({ ...prev, loading: true }));
    const fetchDbProfile = async () => {
      try {
        const dbProfile = await loadProfile(userIdOrMe);
        setState((prev) => ({ ...prev, profile: dbProfile }));
      } catch (error) {
        setState((prev) => ({ ...prev, error: 'Failed to fetch profile' }));
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    };
    fetchDbProfile();
  }, [userId, userProfile.user_id]);

  useEffect(() => {
    const userIdOrMe = userId || userProfile.user_id;
    if (!userIdOrMe) {
      setState((prev) => ({ ...prev, error: 'No user ID found' }));
      return;
    }
    const fetchUserStatus = async () => {
      try {
        const userStatus = await loadStatus(userIdOrMe);
        setState((prev) => ({ ...prev, status: userStatus }));
      } catch (error) {
        setState((prev) => ({ ...prev, error: 'Failed to fetch profile' }));
      }
    };
    fetchUserStatus();
  }, [userId, userProfile.user_id]);

  useEffect(() => {
    const userIdOrMe = userId || userProfile.user_id;
    setState((prev) => ({ ...prev, avatarLoading: true }));
    const fetchAvatar = async () => {
      try {
        const imageUrl = await loadProfileAvatar(userIdOrMe);
        setAvatarUrl(imageUrl);
      } catch (error) {
        console.error('Error fetching avatar:', error);
      } finally {
        setState((prev) => ({ ...prev, avatarLoading: false }));
      }
    };
    fetchAvatar();
  }, [userId, userProfile.user_id]);

  useEffect(() => {
    const userIdOrMe = userId || userProfile.user_id;
    setState((prev) => ({ ...prev, friendsLoading: true }));
    const fetchFriends = async () => {
      try {
        const profileFriends = await loadFriends(userIdOrMe);
        setFriends(profileFriends);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setState((prev) => ({ ...prev, friendsLoading: false }));
      }
    };
    fetchFriends();
  }, [userId, userProfile.user_id]);

  if (state.loading) {
    return <p>Loading profile...</p>;
  }

  if (state.error) {
    return <p>Error: {state.error}</p>;
  }

  const handleFriendClick = async () => {
    if (isFriend) {
      console.log("Delete friend:", userId);
      await deleteFriend(userProfile.user_id, userId!);
    } else {
      console.log("Add friend:", userId);
      await addFriend(userProfile.user_id, userId!);
    }
  };

  const isFriend = state.friends.includes(userId!);

  return (
    <div className="main">
      <div className="profile">
        <div className="flex">
          <div className="item">
            {state.avatarLoading ? <p>Loading avatar...</p> : <img src={state.avatarUrl} alt="User avatar" />}
            <h3 className='name text-dark'>{state.profile?.user_name}</h3>
            <div className="item">
              <span className={`status-indicator ${state.status === 'Online' ? 'online' : 'offline'}`}></span>
              {state.status}
            </div>
            <div>
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
                <h3 className='name text-dark'>Leaderboard position: <span className="stat"><strong>{state.profile?.leaderboard_position}</strong></span></h3>
                <span className="stat">Total players <strong>{state.profile?.total_players}</strong></span>
                <h3 className='name text-dark'>Opponents</h3>
                {state.profile?.most_frequent_opponent?.map((opponent) => (
                  <div key={opponent.user_name}>
                    <div className="stat">Most frequent opponent: </div>
                    <NavLink to={`/profile/${opponent.user_id}`}>{opponent.user_name}</NavLink>
                  </div>
                ))}
                <h3 className='name text-dark'>Games Against players</h3>
                <span className="stat">Total played games <strong>{state.profile?.games_against_human?.total_played_games}</strong></span>
                <span className="stat">max_score <strong>{state.profile?.games_against_human?.max_score}</strong></span>
                <span className="stat">Wins: <strong>{state.profile?.games_against_human?.wins}</strong></span>
                <span className="stat">Draws: <strong>{state.profile?.games_against_human?.draws}</strong></span>
                <span className="stat">Losses: <strong>{state.profile?.games_against_human?.losses}</strong></span>
                <h4 className='name text-dark'>Total time played against players</h4>
                <span className="stat">Weeks <strong>{state.profile?.games_against_human?.total_time_played?.weeks}</strong></span>
                <span className="stat">Days <strong>{state.profile?.games_against_human?.total_time_played?.days}</strong></span>
                <span className="stat">Hours: <strong>{state.profile?.games_against_human?.total_time_played?.hours}</strong></span>
                <span className="stat">Minutes: <strong>{state.profile?.games_against_human?.total_time_played?.minutes}</strong></span>
                <span className="stat">Seconds: <strong>{state.profile?.games_against_human?.total_time_played?.seconds}</strong></span>
                <h3 className='name text-dark'>Games Against bot</h3>
                <span className="stat">total_played_games <strong>{state.profile?.games_against_bot?.total_played_games}</strong></span>
                <span className="stat">max_score <strong>{state.profile?.games_against_bot?.max_score}</strong></span>
                <span className="stat">Wins: <strong>{state.profile?.games_against_bot?.wins}</strong></span>
                <span className="stat">Draws: <strong>{state.profile?.games_against_bot?.draws}</strong></span>
                <span className="stat">Losses: <strong>{state.profile?.games_against_bot?.losses}</strong></span>
                <h4 className='name text-dark'>Total time played against bot</h4>
                <span className="stat">Weeks <strong>{state.profile?.games_against_bot?.total_time_played?.weeks}</strong></span>
                <span className="stat">Days <strong>{state.profile?.games_against_bot?.total_time_played?.days}</strong></span>
                <span className="stat">Hours: <strong>{state.profile?.games_against_bot?.total_time_played?.hours}</strong></span>
                <span className="stat">Minutes: <strong>{state.profile?.games_against_bot?.total_time_played?.minutes}</strong></span>
                <span className="stat">Seconds: <strong>{state.profile?.games_against_bot?.total_time_played?.seconds}</strong></span>
              </div>
            </div>
          </div>
        </div>
        {state.friendsLoading ? <p>Loading friends...</p> : <h4 className='name text-dark'>Friends</h4>}
        {state.friends.length > 0 ? (
          <div className="friend-link">
            {state.friends.map((friend, index) => (
              <div key={`${friend}-${index}`}>
                <NavLink to={`/profile/${friend}`} className={({ isActive }) =>
                  isActive ? "active" : undefined
                }>
                  <strong>{friend}</strong>
                </NavLink>
              </div>
            ))}
          </div>
        ) : (
          <aside className="friends">No friends to display.</aside>
        )}
      </div>
    </div>
  );
}

export default Profile;

import React, { useEffect, useState, useContext, useMemo } from "react";
import { useParams, NavLink } from "react-router-dom";
import { loadProfileAvatar } from "../../utils/profileUtils";
import { loadFriends, addFriend, deleteFriend } from "../../utils/friendsUtils";
import UserContext, { IUserContext } from "../../context/UserContext";
import { UserProfile, UserStatus, Friends } from "../../types/shared";
import "./Profile.css";

export const Profile = () => {

  const { userId } = useParams<{ userId?: string }>();
  const { userIdContext, friendsContext, setFriendsContext } = useContext<IUserContext>(UserContext);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [friends, setFriends] = useState<Friends[]>([]);
  const [avatarLoading, setAvatarLoading] = useState<boolean>(false);
  const [friendsLoading, setFriendsLoading] = useState<boolean>(false);
  const [isFriend, setIsFriend] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const userIdOrMe = useMemo(() => userId || userIdContext, [userId, userIdContext]);

  useEffect(() => {
    if (!userIdOrMe) {
      setError('No user ID found in fetchDbProfile');
      console.log('userIdOrMe ', userIdOrMe);
      console.log('userIdContext ', userIdContext);
      return;
    }
    const fetchDbProfile = async () => {
      try {
        const response = await fetch(`http://localhost:3001/profile/${userIdOrMe}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const profileData: UserProfile = await response.json();
        setProfile(profileData);
      } catch (error) {
        setError('Failed to fetch profile');
        console.error('Error fetching profile:', error);
      }
    };

    fetchDbProfile();
  }, [userIdOrMe]);

  useEffect(() => {
    if (!userIdOrMe) {
      setError('No user ID found in fetchUserStatus');
      console.log('userIdOrMe ', userIdOrMe);
      console.log('userIdContext ', userIdContext);
      return;
    }
    const fetchUserStatus = async () => {
      try {
        const response = await fetch(`http://localhost:3001/status/${userIdOrMe}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const fetchedUserStatus: UserStatus = await response.json();
        setUserStatus(fetchedUserStatus);
      } catch (error) {
        setError('Failed to fetch user status');
        console.error('Error fetching user status:', error);
      }
    };

    fetchUserStatus();
  }, [userIdOrMe]);

  useEffect(() => {
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
    if (!userId) {
      setFriendsLoading(true);
      const fetchFriends = async () => {
        try {
          const listFriends = await loadFriends(userIdContext);
          setFriends(listFriends ?? []); // Handle undefined case by defaulting to an empty array
          setFriendsContext(listFriends ?? []); // Handle undefined case by defaulting to an empty array
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setFriendsLoading(false);
        }
      };
      fetchFriends();
    }
  }, [userIdContext, setFriendsContext]);

  useEffect(() => {
    if (userId && friendsContext) {
      setIsFriend(friendsContext.some(friend => friend.userId === userId));
    }
  }, [friendsContext, userId]);

  const handleFriendClick = async () => {
    if (isFriend) {
      const deleted = await deleteFriend(userIdContext, userId!);
      if (deleted !== null) {
        const newFriends = friendsContext.filter(friend => friend.userId !== userId);
        setFriendsContext(newFriends);
        setIsFriend(false);
      }
    } else {
      const added = await addFriend(userIdContext, userId!);
      if (added !== null) {
        const newFriends = [...friendsContext, { userId: userId!, userName: '', status: '' }];
        setFriendsContext(newFriends);
        setIsFriend(true);
      }
    }
  };
  // useEffect(() => {
  //   if (userId && friendsContext) {
  //     setIsFriend(friendsContext.some(friend => friend.userId === userId));
  //   }
  // }, [friendsContext, userId]);

  const userStatusIndicator = userStatus?.status;

  return (
    <div className="main">
      <div className="profile">
        <div className="flex">
          <div className="item">
            {avatarLoading ? <p>Loading avatar...</p> : <img src={avatarUrl} alt="User avatar" />}
            <h4 className='profile-text-dark'>{profile?.userInfo?.userName}</h4>
            <div className="item">
              <span className={`status-indicator ${userStatusIndicator}`}></span>
              <span>{userStatusIndicator}</span>
            </div>
            <div >
              {userId && userId !== userIdContext && (
                <button onClick={handleFriendClick}>
                  {isFriend ? 'Delete Friend' : 'Add Friend'}
                </button>
              )}
            </div>
          </div>
          <div className="item">
            <div className="info">
              <div className="stats">
                <h4 className='profile-text-dark'>Leaderboard position: <span className="stat"><strong>{profile?.leaderboardPosition}</strong></span></h4>
                <span className="stat">Total players <strong>{profile?.totalPlayers}</strong></span>
                <h4 className='profile-text-dark'>Most freuent Opponents</h4>
                {profile && profile.mostFrequentOpponent?.map((opponent) => (
                  <div key={opponent.userId}>
                    <div className="stat-column"></div>
                    <NavLink to={`/profile/${opponent.userId}`}>{opponent.userName}</NavLink>
                  </div>
                ))}
                <h4 className='profile-text-dark'>Games Against players</h4>
                <div className="flex">
                  <div className="stat-column">
                    <span className="stat">Total played games <strong>{profile?.gamesAgainstHuman?.totalPlayedGames}</strong></span>
                    <span className="stat">High score <strong>{profile?.gamesAgainstHuman?.maxScore}</strong></span>
                    <span className="stat">Wins: <strong>{profile?.gamesAgainstHuman?.wins}</strong></span>
                    <span className="stat">Draws: <strong>{profile?.gamesAgainstHuman?.draws}</strong></span>
                    <span className="stat">Losses: <strong>{profile?.gamesAgainstHuman?.losses}</strong></span>
                  </div>
                </div>

                <h4 className='profile-text-dark'>Total time played against players</h4>
                <div className="flex">
                  <div className="item info">
                    <span className="stat">Weeks <strong>{profile?.gamesAgainstHuman?.totalTimePlayed?.weeks}</strong></span>
                    <span className="stat">Days <strong>{profile?.gamesAgainstHuman?.totalTimePlayed?.days}</strong></span>
                    <span className="stat">Hours <strong>{profile?.gamesAgainstHuman?.totalTimePlayed?.hours}</strong></span>
                    <span className="stat">Minutes <strong>{profile?.gamesAgainstHuman?.totalTimePlayed?.minutes}</strong></span>
                    <span className="stat">Seconds <strong>{profile?.gamesAgainstHuman?.totalTimePlayed?.seconds}</strong></span>
                  </div>
                </div>
                <h4 className='profile-text-dark'>Games Against bot</h4>
                <div className="flex">
                  <div className="stat-column">
                    <span className="stat">Total played games <strong>{profile?.gamesAgainstBot?.totalPlayedGames}</strong></span>
                    <span className="stat">High score <strong>{profile?.gamesAgainstBot?.maxScore}</strong></span>
                    <span className="stat">Wins: <strong>{profile?.gamesAgainstBot?.wins}</strong></span>
                    <span className="stat">Draws: <strong>{profile?.gamesAgainstBot?.draws}</strong></span>
                    <span className="stat">Losses: <strong>{profile?.gamesAgainstBot?.losses}</strong></span>
                  </div>
                </div>
                <h4 className='profile-text-dark'>Total time played against bot</h4>
                <div className="flex">
                  <div className="item info">
                    <span className="stat">Weeks <strong>{profile?.gamesAgainstBot?.totalTimePlayed?.weeks}</strong></span>
                    <span className="stat">Days <strong>{profile?.gamesAgainstBot?.totalTimePlayed?.days}</strong></span>
                    <span className="stat">Hours <strong>{profile?.gamesAgainstBot?.totalTimePlayed?.hours}</strong></span>
                    <span className="stat">Minutes <strong>{profile?.gamesAgainstBot?.totalTimePlayed?.minutes}</strong></span>
                    <span className="stat">Seconds <strong>{profile?.gamesAgainstBot?.totalTimePlayed?.seconds}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="item"><div className="name text-dark">{error && <p>{error}</p>}</div></div>
        <div className="flex">
          <div className="item">
            {!userId && userId !== userIdContext && (
              <>
                {friendsLoading ? (
                  <p>Loading friends...</p>
                ) : (
                  <div>
                    <h4 className='title'>Friends</h4>
                    {friends && friends.length > 0 ? (
                      <div className="friends">
                        <ul>
                          {friends.map((friend) => (
                            <li key={friend.userId}>
                              <NavLink
                                to={`/profile/${friend.userId}`}
                                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                              >
                                {friend.userName}
                              </NavLink>
                              <span className="statsFriends">Status:</span>
                              <span className={`status-indicator ${friend.status}`}></span>
                              <span>{friend.status}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : <div className="friends">
                      <span className="statsFriends">No friends to display</span>
                    </div>}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;

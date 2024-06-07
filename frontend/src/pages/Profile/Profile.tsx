import React, { useEffect, useState, useContext, useMemo } from "react";
import { useParams, NavLink } from "react-router-dom";
import { loadProfileAvatar, loadGames } from "../../utils/profileUtils";
import { loadFriends, addFriend, deleteFriend } from "../../utils/friendsUtils";
import UserContext, { IUserContext } from "../../context/UserContext";
import { UserProfile, UserStatus, Friends, Games } from "../../types/shared";
import useStorage from "../../hooks/useStorage";
import "./Profile.css";

export const Profile = () => {

  const { userId } = useParams<{ userId?: string }>();
  const { userIdContext, friendsContext, setFriendsContext } = useContext<IUserContext>(UserContext);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userIdStorage, ,] = useStorage<string>('userId', '');
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [friends, setFriends] = useState<Friends[]>([]);
  const [games, setGames] = useState<Games[]>([]);
  const [avatarLoading, setAvatarLoading] = useState<boolean>(false); // loading avatar
  const [friendsLoading, setFriendsLoading] = useState<boolean>(false);
  const [isFriend, setIsFriend] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const userIdOrMe = useMemo(() => userId || userIdStorage, [userId, userIdStorage]);
  console.log(`IN PROFILE userIdStorage - ${userIdStorage}/ userIdContext?${userIdContext}`)

  useEffect(() => {
    if (!userIdOrMe) {
      setError('No user ID found in Profile');
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
      setError('No user ID found in Profile');
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
  }, [userIdOrMe, setUserStatus]);

  useEffect(() => {
    if (!userIdOrMe) {
      setError('No user ID found in Profile');
      return;
    }
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
    if (!userIdOrMe) {
      setError('No user ID found in Profile');
      return;
    }
    setFriendsLoading(true);
    const fetchFriends = async () => {
      try {
        const listFriends = await loadFriends(userIdOrMe);
        setFriends(listFriends ?? []);
        setFriendsContext(listFriends ?? []);
      } catch (error) {
        console.error("Error fetching friends:", error);
      } finally {
        setFriendsLoading(false);
      }
    };
    fetchFriends();
  }, [userIdOrMe, setFriendsContext]);

  useEffect(() => {
    if (!userIdOrMe) {
      setError('No user ID found in Profile');
      return;
    }
    const fetchGames = async () => {
      try {
        const gameHystory = await loadGames(userIdOrMe);
        setGames(gameHystory);
      } catch (error) {
        console.error("Error fetching games History:", error);
      }
    };
    fetchGames();
  }, [userIdOrMe, setGames]);


  useEffect(() => {
    if (userId && friendsContext) {
      setIsFriend(friendsContext.some(friend => friend.userId === userId));
    }
  }, [friendsContext, userId]);

  const handleFriendClick = async () => {
    if (isFriend) {
      const deleted = await deleteFriend(userIdStorage, userId!);
      if (deleted !== null) {
        const newFriends = friendsContext.filter(friend => friend.userId !== userId);
        setFriendsContext(newFriends);
        setIsFriend(false);
      }
    } else {
      const added = await addFriend(userIdStorage, userId!);
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
            <h4 className='profile-text'>{profile?.userInfo?.userName}</h4>
            <div className="item">
              <span className={`status-indicator ${userStatusIndicator}`}></span>
              <span>{userStatusIndicator}</span>
            </div>
            <div >
              {userId && userId !== userIdStorage && (
                <button onClick={handleFriendClick}>
                  {isFriend ? 'Delete Friend' : 'Add Friend'}
                </button>
              )}
            </div>
          </div>
          <div className="item">
            <div className="info">
              <div className="stats">
                <h4 className='profile-text-dark'>Leaderboard position: <span className="stat"><strong>{profile?.leaderboard?.position}</strong>of</span><strong>{profile?.totalPlayers}</strong></h4>
                <span className="stat">Total points: <strong>{profile?.leaderboard?.totalPoints}</strong></span>
                <h4 className='profile-text-dark'>Most frequent Opponent</h4>
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
                  </div>
                    <span className="stat"><strong>{profile?.gamesAgainstHuman?.wins}</strong>Wins</span>
                    <span className="stat"><strong>{profile?.gamesAgainstHuman?.draws}</strong>Draws</span>
                    <span className="stat"><strong>{profile?.gamesAgainstHuman?.losses}</strong> Losses</span>
                </div>

                <h4 className='profile-text-dark'>Total time played against players</h4>
                <div className="flex">
                  <div className="item info">
                    {profile && profile?.gamesAgainstHuman?.totalTimePlayed?.weeks > 0 ? <span className="stat"><strong>{profile?.gamesAgainstHuman?.totalTimePlayed?.weeks}</strong>Weeks</span> : null}
                    {profile && profile?.gamesAgainstHuman?.totalTimePlayed?.days > 0 ? <span className="stat"><strong>{profile?.gamesAgainstHuman?.totalTimePlayed?.days}</strong>Days</span> : null}
                    <span className="stat"><strong>{profile?.gamesAgainstHuman?.totalTimePlayed?.hours}</strong>Hours</span>
                    <span className="stat"><strong>{profile?.gamesAgainstHuman?.totalTimePlayed?.minutes}</strong>Minutes</span>
                    <span className="stat"><strong>{profile?.gamesAgainstHuman?.totalTimePlayed?.seconds}</strong>Seconds</span>
                  </div>
                </div>
                <h4 className='profile-text-dark'>Games Against bot</h4>
                <div className="flex">
                  <div className="stat-column">
                    <span className="stat">Total played games <strong>{profile?.gamesAgainstBot?.totalPlayedGames}</strong></span>
                    <span className="stat">High score <strong>{profile?.gamesAgainstBot?.maxScore}</strong></span>
                  </div>
                    <span className="stat"><strong>{profile?.gamesAgainstBot?.wins}</strong>Wins</span>
                    <span className="stat"><strong>{profile?.gamesAgainstBot?.draws}</strong>Draws</span>
                    <span className="stat"><strong>{profile?.gamesAgainstBot?.losses}</strong>Losses</span>
                </div>
                <h4 className='profile-text-dark'>Total time played against bot</h4>
                <div className="flex">
                  <div className="item info">
                    {profile && profile?.gamesAgainstBot?.totalTimePlayed?.weeks > 0 ? <span className="stat"><strong>{profile?.gamesAgainstBot?.totalTimePlayed?.weeks}</strong>Weeks</span> : null}
                    {profile && profile?.gamesAgainstBot?.totalTimePlayed?.days > 0 ? <span className="stat"><strong>{profile?.gamesAgainstBot?.totalTimePlayed?.days}</strong>Days</span> : null}
                    {profile && profile?.gamesAgainstBot?.totalTimePlayed?.hours > 0 ? <span className="stat"><strong>{profile?.gamesAgainstBot?.totalTimePlayed?.hours}</strong>Hours</span> : null}
                    {profile && profile?.gamesAgainstBot?.totalTimePlayed?.minutes > 0 ? <span className="stat"><strong>{profile?.gamesAgainstBot?.totalTimePlayed?.minutes}</strong>Minutes</span> : null}
                    {profile && profile?.gamesAgainstBot?.totalTimePlayed?.seconds > 0 ? <span className="stat"><strong>{profile?.gamesAgainstBot?.totalTimePlayed?.seconds}</strong>Seconds</span> : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {error && (
          <div className="text-dark">
            <p>{error}</p>
          </div>
        )}
        <div className="flex">
          <div className="item">
            {/* {!userId && userId !== userIdStorage && ( */}
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
                            <span className="statsFriends"></span>
                            <span className={`status-indicator ${friend.status}`}></span>
                            <span>{friend.status}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : <div className="friends">
                    <span className="statsFriends">You have no friends :(</span>
                  </div>}
                </div>
              )}
            </>
            <div>
              {games.length > 0 ? (
                <div className="games">
                  <h4 className='title'>Games</h4>
                  <ul>
                    {games.map((game) => (
                      <li key={game.player1Id}>
                        <div className="gameHistory">
                          <div className="stats">
                            <span className="player-name">{game.player1Name} {game.player1Score} : </span>
                            <span className="player-name">{game.player2Score} {game.player2Name}</span>
                            {/* <span className="player-score">{game.player1Score}</span> */}
                          </div>
                          <div className="player">
                            {/* <span className="player-name">{game.player2Name} {game.player2Score}</span> */}
                            {/* <span className="player-score">{game.player2Score}</span> */}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="games">
                  <span className="statsGames">No games played yet</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="userMatchHistory">

      </div>
    </div>
  );
}

export default Profile;

/*
player1Id
:
"8a201d4a-8d97-4e47-944e-62a94dff8d05"
player1Name
:
"emlicame"
player1Score
:
10
player2Id
:
"2bb73bf2-3937-444b-8087-17624499edb2"
player2Name
:
"Rando49776"
player2Score
:
2
*/

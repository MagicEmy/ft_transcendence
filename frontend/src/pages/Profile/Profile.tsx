// src/components/Profile/Profile.tsx

import React, { useEffect, useState, useContext } from "react";
import { useParams, NavLink } from "react-router-dom";
import { loadProfileAvatar } from "../../utils/profileUtils";
import { loadFriends, addFriend, deleteFriend } from "../../utils/friends";
import useStorage from "../../hooks/useStorage";
import { UserProfile, User, Friends } from "../../types/shared";
import UserContext from "../../context/UserContext";
import "./Profile.css";

interface UserStatus {
  status?: string;
}

const Profile = (): JSX.Element => {
  const { userId } = useParams<{ userId: string }>();
  const { userIdContext } = useContext(UserContext);
  const [userDataStorage, setUserDataStorage] = useStorage<User>("user", {});

  const [profile, setProfile] = useState<UserProfile>({ user_name: "" });
  const [userStatus, setUserStatus] = useState<{ status?: string }>({});
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [friends, setFriends] = useState<Friends[]>([]);
  const [avatarLoading, setAvatarLoading] = useState<boolean>(false);
  const [friendsLoading, setFriendsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const userLoggedIn = userDataStorage.user_id;

  useEffect(() => {
    console.log(
      "in PROFILE line 28 userIdContext",
      userIdContext,
      "userProfile",
      userLoggedIn
    );
    const userIdOrMe = userId || userLoggedIn;
    if (!userIdOrMe) {
      setError("No user ID found");
      return;
    }
    const fetchDbProfile = async () => {
      try {
        const response = await fetch(
          `http://localhost:3002/profile/${userIdOrMe}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const profile = await response.json();
        setProfile(profile);
      } catch (error) {
        setError("Failed to fetch profile");
        console.error("Error fetching profile:", error);
      }
    };

    fetchDbProfile();
  }, [userId, userLoggedIn]);

  useEffect(() => {
    const userIdOrMe = userId || userLoggedIn;
    if (!userIdOrMe) {
      setError("No user ID found");
      return;
    }

    const fetchUserStatus = async () => {
      try {
        const response = await fetch(
          `http://localhost:3002/user/${userIdOrMe}/status`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const fetchedUserStatus = await response.json();
        setUserStatus(fetchedUserStatus);
        console.log("HERE userStatus", fetchedUserStatus);
      } catch (error) {
        setError("Failed to fetch profile");
      }
    };

    fetchUserStatus();
  }, [userId, userLoggedIn]);

  useEffect(() => {
    const userIdOrMe = userId || userLoggedIn;
    setAvatarLoading(true);
    const fetchAvatar = async () => {
      try {
        const imageUrl = await loadProfileAvatar(userIdOrMe as string);
		if (imageUrl)
	        setAvatarUrl(imageUrl);
      } catch (error: any) {
        console.error("Error fetching avatar:", error.message);
      } finally {
        setAvatarLoading(false);
      }
    };
    fetchAvatar();
  }, [userId, userLoggedIn]);

  useEffect(() => {
    const userIdOrMe = userId || userLoggedIn;
    setFriendsLoading(true);
    const fetchFriends = async () => {
      try {
        const profileFriends = await loadFriends(userIdOrMe as string);
		if (profileFriends)
          setFriends(profileFriends);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setFriendsLoading(false);
      }
    };
    fetchFriends();
  }, [userId, userLoggedIn]);

  const handleFriendClick = async () => {
    if (isFriend) {
      console.log("Delete friend:", userId);
      await deleteFriend(userLoggedIn as string, userId as string);
    } else {
      console.log("Add friend:", userId);
      await addFriend(userLoggedIn as string, userId as string);
    }
  };

  const isFriend = friends.some(friend => friend.user_id === userId);
  console.log("Profile IN PROFILE", profile);

  return (
    <div className="main">
      <div className="profile">
        <div className="flex">
          <div className="item">
            {avatarLoading ? (
              <p>Loading avatar...</p>
            ) : (
              <img src={avatarUrl} alt="User avatar" />
            )}
            <h3 className="name text-dark">{profile?.user_name}</h3>
            <div className="item">
              <span
                className={`status-indicator ${
                  userStatus.status === "online" ? "online" : "offline"
                }`}
              ></span>
            </div>
            <div>
              {userId !== profile.user_id && (
                <button onClick={handleFriendClick}>
                  {isFriend ? "Delete Friend" : "Add Friend"}
                </button>
              )}
            </div>
          </div>
          <div className="item">
            <div className="info">
              <div className="stats">
                <h3 className="name text-dark">
                  Leaderboard position:{" "}
                  <span className="stat">
                    <strong>{profile?.leaderboard_position}</strong>
                  </span>
                </h3>
                <span className="stat">
                  Total players <strong>{profile?.total_players}</strong>
                </span>
                <h3 className="name text-dark">Opponents</h3>
                {profile &&
                  profile.most_frequent_opponent?.map((opponent) => (
                    <div key={opponent.user_name}>
                      <div className="stat">Most frequent opponent: </div>
                      <NavLink to={`/profile/${opponent.user_id}`}>
                        {opponent.user_name}
                      </NavLink>
                    </div>
                  ))}
                <h3 className="name text-dark">Games Against players</h3>
                <span className="stat">
                  Total played games{" "}
                  <strong>
                    {profile?.games_against_human?.total_played_games}
                  </strong>
                </span>
                <span className="stat">
                  max_score{" "}
                  <strong>{profile?.games_against_human?.max_score}</strong>
                </span>
                <span className="stat">
                  Wins: <strong>{profile?.games_against_human?.wins}</strong>
                </span>
                <span className="stat">
                  Draws: <strong>{profile?.games_against_human?.draws}</strong>
                </span>
                <span className="stat">
                  Losses:{" "}
                  <strong>{profile?.games_against_human?.losses}</strong>
                </span>
                <h4 className="name text-dark">
                  Total time played against players
                </h4>
                <span className="stat">
                  Weeks{" "}
                  <strong>
                    {profile?.games_against_human?.total_time_played?.weeks}
                  </strong>
                </span>
                <span className="stat">
                  Days{" "}
                  <strong>
                    {profile?.games_against_human?.total_time_played?.days}
                  </strong>
                </span>
                <span className="stat">
                  Hours:{" "}
                  <strong>
                    {profile?.games_against_human?.total_time_played?.hours}
                  </strong>
                </span>
                <span className="stat">
                  Minutes:{" "}
                  <strong>
                    {profile?.games_against_human?.total_time_played?.minutes}
                  </strong>
                </span>
                <span className="stat">
                  Seconds:{" "}
                  <strong>
                    {profile?.games_against_human?.total_time_played?.seconds}
                  </strong>
                </span>
                <h3 className="name text-dark">Games Against bot</h3>
                <span className="stat">
                  total_played_games{" "}
                  <strong>
                    {profile?.games_against_bot?.total_played_games}
                  </strong>
                </span>
                <span className="stat">
                  max_score{" "}
                  <strong>{profile?.games_against_bot?.max_score}</strong>
                </span>
                <span className="stat">
                  Wins: <strong>{profile?.games_against_bot?.wins}</strong>
                </span>
                <span className="stat">
                  Draws: <strong>{profile?.games_against_bot?.draws}</strong>
                </span>
                <span className="stat">
                  Losses: <strong>{profile?.games_against_bot?.losses}</strong>
                </span>
                <h4 className="name text-dark">
                  Total time played against bot
                </h4>
                <span className="stat">
                  Weeks{" "}
                  <strong>
                    {profile?.games_against_bot?.total_time_played?.weeks}
                  </strong>
                </span>
                <span className="stat">
                  Days{" "}
                  <strong>
                    {profile?.games_against_bot?.total_time_played?.days}
                  </strong>
                </span>
                <span className="stat">
                  Hours:{" "}
                  <strong>
                    {profile?.games_against_bot?.total_time_played?.hours}
                  </strong>
                </span>
                <span className="stat">
                  Minutes:{" "}
                  <strong>
                    {profile?.games_against_bot?.total_time_played?.minutes}
                  </strong>
                </span>
                <span className="stat">
                  Seconds:{" "}
                  <strong>
                    {profile?.games_against_bot?.total_time_played?.seconds}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>
        {friendsLoading ? (
          <p>Loading friends...</p>
        ) : (
          <h4 className="name text-dark">Friends</h4>
        )}
        {friends && friends.length > 0 ? (
          <div className="friend-link">
            {friends.map((friend, index) => (
              <div key={`${friend}-${index}`}>
                <NavLink
                  to={`/profile/${friend}`}
                  className={({ isActive }) =>
                    isActive ? "active" : undefined
                  }
                >
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
};

export default Profile;

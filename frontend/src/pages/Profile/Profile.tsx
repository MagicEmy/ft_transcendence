import React, { useEffect, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import { addFriend, deleteFriend } from "../../utils/friendsUtils";
import { Friends, } from "../../types/shared";
import useStorage from "../../hooks/useStorage";
import "./Profile.css";
import { useGetFriends, useGetProfile, useGetUserStatus, useGetAvatar } from "../../hooks";
import { MatchHistory } from "../../components/MatchHistory";
import { FriendsList } from "../../components/FriendsList";
import { UserStats } from "../../components/UserStats";
import { AddFriendButton } from "./AddFriendButton";

export const Profile = () => {

  const { userId } = useParams<{ userId?: string }>();
  const [userIdStorage, ,] = useStorage<string>('userId', '');
  const userIdOrMe = userId || userIdStorage;
  const { profile } = useGetProfile(userIdOrMe);
  const { userStatus } = useGetUserStatus(userIdOrMe);
  const { avatar: avatarUrl, isLoading: avatarLoading } = useGetAvatar(userIdOrMe);
  const [isFriend, setIsFriend] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const { friends: loggedUserFriends } = useGetFriends(userIdStorage);
  const { friends: userProfileFriends } = useGetFriends(userIdOrMe);
  const [friends, setFriends] = useState<Friends[]>([]);

  console.log(`IN PROFILE userIdStorage - ${userIdStorage}`)

  useEffect(() => {
    if (userId && loggedUserFriends) {
      setIsFriend(loggedUserFriends.some(friend => friend.userId === userId));
    }
  }, [loggedUserFriends, userId]);

  useEffect(() => {
    userProfileFriends && setFriends(userProfileFriends)
  }, [userProfileFriends]);

  const handleFriendClick = async () => {

    if (isFriend) {
      const deleted = await deleteFriend(userIdStorage, userId!);
      if (deleted !== null && loggedUserFriends) {
        const newFriends = loggedUserFriends.filter(friend => friend.userId !== userId);
        setFriends(newFriends);
        setIsFriend(false);
      }
    } else {
      const added = await addFriend(userIdStorage, userId!);
      if (added !== null && loggedUserFriends) {
        const newFriends = [...loggedUserFriends, { userId: userId!, userName: '', status: '' }];
        setFriends(newFriends);
        setIsFriend(true);
      }
    }
  };


  const userStatusIndicator = userStatus?.status;

  return (
    <div className="main">
      <div className="profile">
        <div className="columnsWrapper">
          <div className="flex">
            <div className="item">
              {avatarLoading ? <p>Loading avatar...</p> : <img src={avatarUrl} alt="User avatar" />}
              <h4 className='profile-text'>{profile?.userInfo?.userName}</h4>
              <div className="item">
                <span className={`status-indicator ${userStatusIndicator}`}></span>
                <span>{userStatusIndicator}</span>
              </div>
              {userId && userId !== userIdStorage && (
                <AddFriendButton onClick={handleFriendClick}>
                  {isFriend ? 'Delete Friend' : 'Add Friend'}
                </AddFriendButton>
              )}
            </div>
            <div className="item">
              <UserStats />
            </div>
            <FriendsList userId={userIdOrMe} />
          </div>
          <MatchHistory userId={userIdOrMe} />
        </div>
        {error && (
          <div className="text-dark">
            <p>{error}</p>
          </div>
        )}
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

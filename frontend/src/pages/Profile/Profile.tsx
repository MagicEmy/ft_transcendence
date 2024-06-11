import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { addFriend, deleteFriend } from "../../utils/friendsUtils";
import { Friends, } from "../../types/shared";
// import useStorage from "../../hooks/useStorage";
import "./Profile.css";
import { useGetFriends, useGetProfile, useGetUserStatus, useGetAvatar } from "../../hooks";
import { MatchHistory } from "../../components/MatchHistory";
import { FriendsList } from "../../components/FriendsList";
import { UserStats } from "../../components/UserStats";
import { AddFriendButton } from "../../components/AddFriendButton";
import UserContext, { IUserContext } from '../../context/UserContext';


export const Profile = () => {

  const { userId } = useParams<{ userId?: string }>();
  const { userIdContext } = useContext<IUserContext>(UserContext);
  const userIdOrMe = userId || userIdContext;

  const { profile } = useGetProfile(userIdOrMe);
  const { userStatus } = useGetUserStatus(userIdOrMe);
  const { avatar: avatarUrl, isLoading: avatarLoading } = useGetAvatar(userIdOrMe);
  const [isFriend, setIsFriend] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const { friends: loggedUserFriends } = useGetFriends(userIdContext);
  const { friends: userProfileFriends } = useGetFriends(userIdOrMe);
  const [friends, setFriends] = useState<Friends[]>([]);

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
      const deleted = await deleteFriend(userIdContext, userId!);
      if (deleted !== null && loggedUserFriends) {
        const newFriends = loggedUserFriends.filter(friend => friend.userId !== userId);
        setFriends(newFriends);
        setIsFriend(false);
      }
    } else {
      const added = await addFriend(userIdContext, userId!);
      if (added !== null && loggedUserFriends) {
        const newFriends = [...loggedUserFriends, { userId: userId!, userName: '', status: '' }];
        setFriends(newFriends);
        setIsFriend(true);
      }
    }
  };

  useEffect(() => {
    if (userId && loggedUserFriends) {
      setIsFriend(loggedUserFriends.some(friend => friend.userId === userId));
    }
  }, []);

  console.log('loggedUserFriends', loggedUserFriends);
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
              {userId && userId !== userIdContext && (
                <AddFriendButton onClick={handleFriendClick} className="button" >
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

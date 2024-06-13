import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { addFriend, deleteFriend } from "../../utils/friendsUtils";
import { Friends, } from "../../types/shared";
import { useGetFriends, useGetProfile, useGetUserStatus, useGetAvatar } from "../../hooks";
import { MatchHistory } from "../../components/ProfileStats/MatchHistory";
import { FriendsList } from "../../components/FriendsList";
import { UserStats } from "../../components/ProfileStats/ProfileStats";
import { AddFriendButton } from "../../components/AddFriendButton";
// import useStorage from "../../hooks/useStorage";
// import  ApiErrorPage  from "../../pages/Error/ApiErrorPage";
import UserContext, { IUserContext } from '../../context/UserContext';
import "./Profile.css";

interface ErrorDetails {
  message: string;
  statusCode?: number;
}

export const Profile = () => {

  const { userId } = useParams<{ userId?: string }>();
  const { userIdContext } = useContext<IUserContext>(UserContext);
  const userIdOrMe = userId || userIdContext;

  const { profile } = useGetProfile(userIdOrMe);
  const { userStatus } = useGetUserStatus(userIdOrMe);
  const { avatar: avatarUrl, error: apiError } = useGetAvatar(userIdOrMe);
  const { friends: loggedUserFriends } = useGetFriends(userIdContext);
  const { friends: userProfileFriends } = useGetFriends(userIdOrMe);
  const [ isFriend, setIsFriend] = useState<boolean>(false);
  const [error, setError] = useState<ErrorDetails | undefined>();
  const [ friends, setFriends] = useState<Friends[]>([]);


  useEffect(() => {
    if (apiError) {
      setError(apiError);
    }
  }, [apiError]);


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
  }, [loggedUserFriends, userId]);

  const userStatusIndicator = userStatus?.status;

  return (
    <div className="main">
      <div className="profile">
        <div className="columnsWrapper">
          <div className="flex">
            <div className="item">
              {avatarUrl ?  <img src={avatarUrl} alt="User avatar" /> : <p>Loading avatar...</p>}
              <h4 className='profile-text'>{profile?.userInfo?.userName}</h4>
              <div className="status">
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
            <p>{apiError?.statusCode}</p>
            <p>{apiError?.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;

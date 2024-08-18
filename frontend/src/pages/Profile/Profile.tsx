import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { addFriend, deleteFriend } from '../../utils/friendsUtils';
import { Friends } from '../../types/shared';
import {
  useGetFriends,
  useGetProfile,
  useGetUserStatus,
  useGetAvatarUrl,
  useUpdateStatus,
} from '../../hooks';
import { MatchHistory } from '../../components/ProfileStats/MatchHistory';
import { FriendsList } from '../../components/FriendsList';
import { UserStats } from '../../components/ProfileStats/ProfileStats';
import { AddFriendButton } from '../../components/AddFriendButton';
import UserContext, { IUserContext } from '../../context/UserContext';
import defaultAvatar from '../../assets/defaultAvatar.png';
import './Profile.css';

export const Profile = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId?: string }>();
  const { userIdContext } = useContext<IUserContext>(UserContext);
  const [userIdOrMe, setUserIdOrMe] = useState(userId || userIdContext);
  useUpdateStatus();

  const { profile, error } = useGetProfile(userIdOrMe);
  const { userStatus } = useGetUserStatus(userIdOrMe, 5000);
  const { avatar: avatarUrl } = useGetAvatarUrl(userIdOrMe);
  const { friends: loggedUserFriends } = useGetFriends(
    userIdContext,
    userIdOrMe,
  );
  const { friends: userProfileFriends } = useGetFriends(userIdOrMe, userIdOrMe);
  const [isFriend, setIsFriend] = useState<boolean>(false);
  const [, setFriends] = useState<Friends[]>([]);
  const profileName = profile?.userInfo?.userName;
  const [currentStatus, setCurrentStatus] = useState<string>(
    profile?.userInfo?.status || '',
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setUserIdOrMe(userId || userIdContext);
  }, [userId, userIdContext]);

  useEffect(() => {
    if (userId && loggedUserFriends) {
      setIsFriend(loggedUserFriends.some((friend) => friend.userId === userId));
    }
  }, [loggedUserFriends, userId]);

  useEffect(() => {
    userProfileFriends && setFriends(userProfileFriends);
  }, [userProfileFriends]);

  const handleFriendClick = async () => {
    if (isFriend) {
      const deleted = await deleteFriend(userIdContext, userId!);
      if (deleted !== null && loggedUserFriends) {
        const newFriends = loggedUserFriends.filter(
          (friend) => friend.userId !== userId,
        );
        setFriends(newFriends);
        setIsFriend(false);
      }
    } else {
      const added = await addFriend(userIdContext, userId!);
      if (added !== null && loggedUserFriends) {
        const newFriends = [
          ...loggedUserFriends,
          { userId: userId!, userName: '', status: '' },
        ];
        setFriends(newFriends);
        setIsFriend(true);
      }
    }
  };

  useEffect(() => {
    if (userId && loggedUserFriends) {
      setIsFriend(loggedUserFriends.some((friend) => friend.userId === userId));
    }
  }, [loggedUserFriends, userId]);

  useEffect(() => {
    if (userStatus?.status) {
      setCurrentStatus(userStatus.status);
    }
  }, [userStatus]);

  if (error && (error === 500 || error === 404)) {
    return (
      <div className="profile">
        <h1 className="page-title">Error</h1>
        <h4 className="error-message">
          You must be logged in to view this page
        <button className="button-profile" onClick={() => navigate('/')}>
          Back to login
        </button>
        </h4>
      </div>
    );
  }

  return (
    <div className="main">
      <h1 className="page-title">Profile</h1>
      <div className="profile">
        <div className="columnsWrapper">
          <div className="flex">
            <div className="item">
              {avatarUrl ? (
                <img src={avatarUrl} alt="User avatar" />
              ) : (
                <img src={defaultAvatar} alt="default avatar" />
              )}
              <h4 className="profile-text">{profileName}</h4>
              <div className="status">
                <span className={`status-indicator ${currentStatus}`}></span>
                <span className="text">{currentStatus}</span>
              </div>
              {userId && userId !== userIdContext && (
                <AddFriendButton
                  onClick={handleFriendClick}
                  className="button-profile"
                >
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
          <div className="error-bar">
            <p className="errortext">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

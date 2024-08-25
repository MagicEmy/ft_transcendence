import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { addFriend, deleteFriend } from '../../utils/friendsUtils';
import { Friends } from '../../types/shared';
import {
  useGetFriends,
  useGetProfile,
  useGetUserStatus,
  useGetAvatarUrl,
  useUpdateStatus,
} from '../../hooks';
import Error from '../Error/Error';
import { MatchHistory } from '../../components/ProfileStats/MatchHistory';
import { FriendsList } from '../../components/FriendsList';
import { UserStats } from '../../components/ProfileStats/ProfileStats';
import { AddFriendButton } from '../../components/AddFriendButton';
import useStorage from '../../hooks/useStorage';
import defaultAvatar from '../../assets/defaultAvatar.png';
import './Profile.css';

export const Profile: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const [userIdStorage] = useStorage<string>('userId', '');
  const userIdOrMe = userId || userIdStorage;

  useUpdateStatus();
  const { profile, error: errorProfile } = useGetProfile(userIdOrMe);
  const { userStatus, error: errorStatus } = useGetUserStatus(
    userIdOrMe,
    10000,
  );
  const { avatar: avatarUrl } = useGetAvatarUrl(userIdOrMe);
  const { friends: loggedUserFriends, error: errorFriend } = useGetFriends(
    userIdStorage,
    userIdOrMe,
  );
  const { friends: userProfileFriends, error: errorFriends } = useGetFriends(
    userIdOrMe,
    userIdOrMe,
  );

  const [isFriend, setIsFriend] = useState<boolean>(false);
  const [ , setFriends] = useState<Friends[]>([]);
  const [currentStatus, setCurrentStatus] = useState<string>(
    profile?.userInfo?.status || '',
  );
  const [error, setError] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const newError = errorProfile || errorStatus || errorFriend || errorFriends;
    if (newError) {
      console.error('Error in Profile component:', newError);
      setError(newError);
    }
  }, [errorProfile, errorStatus, errorFriend, errorFriends]);

  useEffect(() => {
    if (userId && loggedUserFriends) {
      setIsFriend(loggedUserFriends.some((friend) => friend.userId === userId));
    }
  }, [loggedUserFriends, userId]);

  useEffect(() => {
    if (userProfileFriends) {
      setFriends(userProfileFriends);
    }
  }, [userProfileFriends]);

  useEffect(() => {
    if (userStatus?.status) {
      setCurrentStatus(userStatus.status);
    }
  }, [userStatus]);

  const handleFriendClick = async () => {
    if (!userId) return;

    const action = isFriend ? deleteFriend : addFriend;
    const result = await action(userIdStorage, userId);

    if (result !== null && loggedUserFriends) {
      const newFriends = isFriend
        ? loggedUserFriends.filter((friend) => friend.userId !== userId)
        : [...loggedUserFriends, { userId, userName: '', status: '' }];
      setFriends(newFriends);
      setIsFriend(!isFriend);
    }
  };

  if (error) {
    return <Error status={error} />;
  }

  return (
    <div className="main">
      <h1 className="page-title">Profile</h1>
      <div className="profile">
        <div className="columnsWrapper">
          <div className="flex">
            <div className="item">
              <img
                src={avatarUrl || defaultAvatar}
                alt={`${profile?.userInfo?.userName || 'User'} avatar`}
              />
              <h4 className="profile-text">{profile?.userInfo?.userName}</h4>
              <div className="status">
                <span className={`status-indicator ${currentStatus}`}></span>
                <span className="text">{currentStatus}</span>
              </div>
              {userId && userId !== userIdStorage && (
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
      </div>
    </div>
  );
};

export default Profile;

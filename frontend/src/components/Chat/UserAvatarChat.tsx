import React, { useState, useEffect } from 'react';
import { loadProfileAvatar } from '../../utils/profileUtils';

const UserAvatarChat = ({ userId, className, updateTrigger }) => {
  const [avatarUrl, setAvatarUrl] = useState('/assets/defaultAvatar.png');

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const url = await loadProfileAvatar(userId);
        setAvatarUrl(url);
      } catch (error) {
        setAvatarUrl('/assets/defaultAvatar.png');
      }
    };
    fetchAvatar();
  });

  return (
    <img
      src={avatarUrl}
      alt="User Avatar"
      className={className}
    />
  );
};

export default UserAvatarChat;

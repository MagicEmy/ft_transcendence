import React, { useState, useEffect } from 'react';
import { host } from '../../utils/ApiRoutes';

const UserAvatarChat = ({ userId, className, updateTrigger }) => {
  const [avatarVersion, setAvatarVersion] = useState(Date.now());

  useEffect(() => {
    setAvatarVersion(Date.now());
  }, [userId, updateTrigger]);

  const avatarUrl = `http://${host}:3001/avatar/${userId}?v=${avatarVersion}`;

  return (
    <img
      src={avatarUrl}
      alt="User Avatar"
      className={className}
      onError={() => setAvatarVersion(Date.now())} 
    />
  );
};

export default UserAvatarChat;

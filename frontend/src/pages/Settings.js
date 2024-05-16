import React, { useState, useEffect } from 'react';
import useStorage from '../hooks/useStorage';
import { loadProfile, loadProfileAvatar } from '../libs/profileData';
import axios from 'axios';

const Settings = () => {
  const [userProfile] = useStorage("user");
  const [avatar, setAvatar] = useStorage("avatar");
  const [profile, setProfile] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [file, setFile] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (userProfile) {
        try {
          const dbProfile = await loadProfile(userProfile.user_id);
          setProfile(dbProfile);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setFeedback('Failed to load user data.');
        }
      }
    };

    fetchUserProfile();
    console.log('userProfile', userProfile);
  }, [userProfile]);

  useEffect(() => {
    const fetchAvatar = async () => {
      if (userProfile?.user_id) {
        try {
          const imageUrl = await loadProfileAvatar(userProfile.user_id);
          setAvatar(imageUrl);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setFeedback('Failed to load user data.');
        }
      }
    };

    fetchAvatar();
  }, [setAvatar]);

  const handleUserNameSubmit = async () => {
    if (newUserName && newUserName !== userProfile.user_name) {
      try {
        await axios.patch(`http://localhost:3002/user/${userProfile.user_id}/${userProfile.user_name}`, {
          user_name: newUserName,
        }, {
          withCredentials: true,
        });
        setProfile({ ...userProfile, user_name: newUserName });
        setFeedback('Username updated successfully.');
      } catch (error) {
        console.error("Error updating user data:", error);
        setFeedback('Failed to update username.');
      }
    };
  };

  const handleAvatarSubmit = async (event) => {
    event.preventDefault();
    setFeedback('');
    if (!file) {
      setFeedback('Please select a file to upload.');
      return;
    }
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setFeedback('Only JPG or PNG images are allowed.');
      return;
    }
    const maxSize = 500 * 1024; // 500KB
    if (file.size > maxSize) {
      setFeedback('The file size must be less than 500KB.');
      return;
    }
    setAvatarLoading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await axios.patch(`http://localhost:3002/user/${userProfile.user_id}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      if (response.data.status === 'success') {
        const newAvatarUrl = response.data.avatarUrl;
        const updatedAvatarUrl = `${newAvatarUrl}?v=${Date.now()}`; // Cache busting
        setAvatar(updatedAvatarUrl);
        setFeedback('Avatar updated successfully.');
      } else {
        throw new Error(response.data.message || 'Failed to update avatar without a specific error.');
      }
    } catch (error) {
      console.error("Error updating avatar:", error);
      setFeedback(`Error updating avatar: ${error.message}`);
    } finally {
      setAvatarLoading(false);
    }
  };



  return (
    <div className="main">
      <div className="profile">
        <div className="flex">
          <div className="item">
          {avatarLoading ? <p>Loading avatar...</p> : <img className='avatar' src={avatar} alt="User Avatar" key={avatar} />}
            <div className="item">Change Profile Picture:</div>
            <form onSubmit={handleAvatarSubmit}>
              <input type="file" onChange={(e) => setFile(e.target.files[0])} disabled={avatarLoading} />
              <br />
              <button type="submit" disabled={avatarLoading}>Upload New Profile Picture</button>
            </form>
          </div>
          <div className="item">
          <h3 className='name text-dark'>{profile?.user_info?.user_name}</h3>
          <div className="item">Change name:</div>
            <input type="text" placeholder="New Username..." onChange={(e) => setNewUserName(e.target.value)} value={newUserName} />
            <button onClick={handleUserNameSubmit}>Submit</button>
          </div>
        </div>
        {feedback && <p>{feedback}</p>}
      </div>
    </div>
  );
};

export default Settings;

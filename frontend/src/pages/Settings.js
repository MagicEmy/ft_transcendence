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
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (userProfile) {
        try {
          const dbProfile = await loadProfile(userProfile.user_id);
          setProfile(dbProfile);
          console.log('quiiiii', dbProfile);
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

  // Reset feedback message
  setFeedback('');

  // Check if file is selected
  if (!file) {
    setFeedback('Please select a file to upload.');
    return;
  }

  // Check file type
  const validTypes = ['image/jpeg', 'image/png'];
  if (!validTypes.includes(file.type)) {
    setFeedback('Only JPG or PNG images are allowed.');
    return;
  }

  // Check file size (500KB)
  const maxSize = 500 * 1024; // 500KB in bytes
  if (file.size > maxSize) {
    setFeedback('The file size must be less than 500KB.');
    return;
  }

  setLoading(true);
  const formData = new FormData();
  formData.append('avatar', file);

  try {
    const response = await axios.patch(`http://localhost:3002/user/${userProfile.user_id}/avatar`, formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.status === 'success') { // Adjust according to actual server response
      // const imageUrl = URL.createObjectURL(response.data);
      const newAvatarUrl = response.data.avatarUrl
      setAvatar(newAvatarUrl);
      setFeedback('Avatar updated successfully.');
    } else {
      throw new Error(response.data.message || 'Failed to update avatar without a specific error.');
    }
  } catch (error) {
    console.error("Error updating avatar:", error);
    if (error.response) {
      // Server responded with a status code that falls out of the range of 2xx
      setFeedback(`Error updating avatar: ${error.response.data.message || error.response.statusText}`);
    } else if (error.request) {
      // The request was made but no response was received
      setFeedback('No response from server.');
    } else {
      // Something happened in setting up the request that triggered an Error
      setFeedback('Error setting up avatar update request.');
    }
  } finally {
    setLoading(false);
    window.location.reload();
  }
};


  return (
    <div className="main">
      <div className="profile">
        <div className="flex">
          <div className="item">
            {avatar  ? <img className='avatar' src={avatar} alt="User Avatar" /> : <p>Loading...</p>}
            <div className="item">Change Profile Picture:</div>
            <form onSubmit={handleAvatarSubmit}>
              <input type="file" onChange={(e) => setFile(e.target.files[0])} disabled={loading} />
              <br />
              <button type="submit" disabled={loading}>Upload New Profile Picture</button>
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

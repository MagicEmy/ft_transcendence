import { ChangeEvent, FormEvent, useState, useContext, useRef } from 'react';
import { AVATAR } from '../utils/constants';
import UserContext, { IUserContext } from '../context/UserContext';
import { Avatar } from './Avatar';

export const ChangeAvatar = () => {
  const { userIdContext, setAvatarContext } =
    useContext<IUserContext>(UserContext);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [avatarLoading, setAvatarLoading] = useState<boolean>(false);

  const clearFeedbackError = () => {
    setTimeout(() => {
      setFeedback('');
    }, 5000);
  };
  const handleAvatarSubmit = async (event: FormEvent) => {
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

    const maxSize = 500000; // 500KB
    if (file.size > maxSize) {
      setFeedback('The file size must be less than 500KB.');
      return;
    }

    setAvatarLoading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch(`${AVATAR}/${userIdContext}`, {
        method: 'PATCH',
        body: formData,
        credentials: 'include',
      });
      if (!response.ok) {
        setFeedback(
          'Failed to update avatar. Please check the server response.',
        );
        throw new Error(`Error: ${response.status}`);
      }
      if (response.ok) {
        const localUrl = URL.createObjectURL(file);
        setAvatarContext(localUrl);
        setFeedback('Avatar updated successfully.');
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFile(null);
    } catch (error) {
      console.error('Error updating avatar:', error);
      setFeedback(`Error updating avatar: ${error}`);
    } finally {
      setAvatarLoading(false);
      clearFeedbackError();
    }
  };

  return (
    <>
      <div className="item">
        <Avatar />
        <div className="text">Change Profile Picture:</div>
        <form onSubmit={handleAvatarSubmit} className="upload-form">
          <input
            type="file"
            className="file-input"
            ref={fileInputRef}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFile(e.target.files ? e.target.files[0] : null)
            }
            disabled={avatarLoading}
          />
          <button
            type="submit"
            className="settings-button"
            disabled={avatarLoading}
          >
            Upload Picture
          </button>
        </form>
      </div>
      {feedback && (
        <div className="text-dark">
          <p>{feedback}</p>
        </div>
      )}
    </>
  );
};

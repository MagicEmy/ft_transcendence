import { useEffect, useContext } from 'react';
import { updateStatus } from '../utils/profileUtils';
import UserContext, { IUserContext } from '../context/UserContext';

export const useNewUserStatus = (newUserStatus: string) => {
  const { userIdContext } = useContext(UserContext) as IUserContext;

  useEffect(() => {
    const newStatus = async () => {
      if (!userIdContext) {
        console.error('User ID context is not available');
        return;
      }

      try {
        await updateStatus(userIdContext, newUserStatus);
        console.log('Status updated successfully');
      } catch (error) {
        console.error('Failed to update status:', error);
      }
    };

    newStatus();
  }, [userIdContext, newUserStatus]);
};
  
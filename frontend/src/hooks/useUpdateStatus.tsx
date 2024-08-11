import { useEffect, useContext } from 'react';
import { updateStatus } from '../utils/profileUtils';
import UserContext, { IUserContext } from '../context/UserContext';

export const useUpdateStatus = () => {
  const { userIdContext } = useContext(UserContext) as IUserContext;
  const statusOnline = 'online';

  useEffect(() => {
    const changeStatus = async () => {
      if (!userIdContext) {
        console.error('User ID context is not available');
        return;
      }

      try {
        await updateStatus(userIdContext, statusOnline);
        console.log('Status updated successfully');
      } catch (error) {
        console.error('Failed to update status:', error);
      }
    };

    changeStatus();
  }, [userIdContext]);
};
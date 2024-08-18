import { useEffect, useContext } from 'react';
import { STATUS } from '../utils/constants';
import UserContext, { IUserContext } from '../context/UserContext';

export const useUpdateStatus = () => {
  const { userIdContext } = useContext(UserContext) as IUserContext;
  const statusOnline = 'online';

  useEffect(() => {
    if (!userIdContext) {
      console.error('User ID context is not available');
      return;
    }
    const changeStatus = async () => {
      const bodyStatus = {
        userId: userIdContext,
        newStatus: statusOnline,
      };
      const body = JSON.stringify(bodyStatus);
      const response = await fetch(STATUS, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      });
      if (!response.ok) {
        console.error('Failed to update user status');
      }
      return;
    };

    changeStatus();
  }, [userIdContext]);
};

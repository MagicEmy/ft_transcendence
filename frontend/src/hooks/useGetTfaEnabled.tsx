
//useGetTfaEnabled.tsx
import { useEffect, useState } from 'react';
import { TFA_STATUS } from '../utils/constants';

export const useGetTfaEnabled = (userId: string) => {
  const [tfaStatus, setTfaStatus] = useState<boolean | null>(null);

  useEffect(() => {
	const getTfaEnabled = async () => {
	  const response = await fetch(`${TFA_STATUS}${userId}`, {
		method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
	  if (response.ok) {
		  const data = await response.json();
		setTfaStatus(data);
	  }
	};
	getTfaEnabled();
  }, [userId]);

  return { tfaStatus };
};

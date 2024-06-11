
//useGetTfaEnabled.tsx
import { useEffect, useState } from 'react';
import { TFA_STATUS } from '../utils/constants';

export const useGetTfaEnabled = (userId: string) => {
  const [tfaStatus, setTfaStatus] = useState<boolean | null>(null);

  useEffect(() => {
	const getTfaEnabled = async () => {
		console.log(`${TFA_STATUS}${userId}`)
	  const response = await fetch(`${TFA_STATUS}${userId}`, {
		method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
	  console.log(response);
	  if (response.ok) {
		const data = await response.json();
		console.log(data);
		setTfaStatus(data);
	  }
	};
	getTfaEnabled();
  }, [userId]);

  return { tfaStatus };
};

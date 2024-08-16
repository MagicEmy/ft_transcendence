import { useState } from 'react';
import useStorage from '../../hooks/useStorage';
import { TFA_QR } from '../../utils/constants';

export const QrCodeGenerator = ({
  setQrCodeUrl,
  setError,
  clearFeedbackError,
}) => {
  const [userIdStorage] = useStorage<string>('userId', '');
  const [userNameStorage] = useStorage<string>('userName', '');

  const handleClick2FA = async () => {
    if (userIdStorage) {
      try {
        const response = await fetch(TFA_QR, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            userId: userIdStorage,
            userName: userNameStorage,
          }),
        });
        if (!response.ok) {
          setError(response.statusText);
          return false;
        }
        const text = await response.text();
        setQrCodeUrl(text);
      } catch (error) {
        setError('Error generating 2FA QR Code: ' + error);
        return false;
      } finally {
        clearFeedbackError();
      }
    }
  };

  return (
    <button type="button" className="TwoFA" onClick={handleClick2FA}>
      <i className="bi bi-qr-code-scan fs-1"></i>
      <h6>Generate QR Code</h6>
    </button>
  );
};

import { useState } from 'react';
import { TFA_ENABLE } from '../../utils/constants';
import useStorage from '../../hooks/useStorage';
import { useGetTfaStatus } from '../../hooks/useGetTfaStatus';

export const Enable2FA = ({
  qrCodeUrl,
  setQrCodeUrl,
  clearFeedbackError,
  setFeedback,
  setError,
  onSuccess,
}) => {
  const [authCode, setAuthCode] = useState<string>('');
  const [userIdStorage] = useStorage<string>('userId', '');
  const { refetch: refetchTfaStatus } = useGetTfaStatus(userIdStorage);

  const handleEnable2FA = async () => {
    if (authCode && userIdStorage) {
      try {
        const response = await fetch(TFA_ENABLE, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userIdStorage,
            code: authCode,
          }),
        });
        if (response.ok) {
          onSuccess();
          setQrCodeUrl(null);
          setFeedback('Two Factor Authentication enabled successfully.');
        } else {
          const errorData = await response.json();
          setError(`Error enabling 2FA: ${errorData.message}`);
          throw new Error(errorData.message || 'Invalid authentication code');
        }
      } catch (error) {
        setError(`Failed to enable Two Factor Authentication. ${error}`);
      } finally {
        refetchTfaStatus();
        setAuthCode('');
        clearFeedbackError();
      }
    } else {
      setError('Invalid authentication code');
      clearFeedbackError();
    }
  };

  return (
    qrCodeUrl && (
      <div className="qr-container">
        <img className="qr-code" src={qrCodeUrl} alt="2FA QR Code" />
        <input
          type="text"
          className="input-auth-code"
          value={authCode}
          onChange={(e) => setAuthCode(e.target.value)}
          placeholder="Enter authentication code"
        />
        <button
          type="button"
          className="settings-button"
          onClick={handleEnable2FA}
        >
          Confirm 2FA
        </button>
      </div>
    )
  );
};

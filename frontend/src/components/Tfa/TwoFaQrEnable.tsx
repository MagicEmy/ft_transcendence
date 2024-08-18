import { useState } from 'react';
import useStorage from '../../hooks/useStorage';
import { TFA_QR, TFA_ENABLE, TFA_DISABLE } from '../../utils/constants';
import { useGetTfaStatus } from '../../hooks/useGetTfaStatus';

export const TwoFaEnable = () => {
  const [userIdStorage] = useStorage<string>('userId', '');
  const [userNameStorage] = useStorage<string>('userName', '');

  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [authCode, setAuthCode] = useState<string>('');
  const [tfaEnable, setTfaEnable] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState<string>('');
  const { tfaStatus, refetch: refetchTfaStatus } =
    useGetTfaStatus(userIdStorage);

  const clearFeedbackError = () => {
    setTimeout(() => {
      setFeedback('');
      setError('');
    }, 5000);
  };

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
        setError('Error generating 2FA QR Code:' + error);
        return false;
      } finally {
        clearFeedbackError();
      }
    }
  };

  const handleEnable2FA = async () => {
    if (authCode && userIdStorage) {
      try {
        const response = await fetch(TFA_ENABLE, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            userId: userIdStorage,
            code: authCode,
          }),
        });
        console.log('handleEnable2FA response', response);
        if (response.ok) {
          setFeedback('Two Factor Authentication enabled successfully.');
          setTfaEnable(true);
        } else {
          const errorData = await response.json();
          setError(`Error enabling 2FA: ${errorData.message}`);
          throw new Error(errorData.message || 'Invalid authentication code');
        }
      } catch (error) {
        setError(`Failed to enable Two Factor Authentication.${error}`);
      } finally {
        refetchTfaStatus();
        setAuthCode('');
        setQrCodeUrl('');
        clearFeedbackError();
      }
    } else {
      setError('Invalid authentication code');
      clearFeedbackError();
    }
  };

  const handleDisable2FA = async () => {
    if (userIdStorage) {
      try {
        const response = await fetch(TFA_DISABLE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            userId: userIdStorage,
          }),
        });
        console.error('response Disable', response);
        if (!response.ok) {
          setError(response.statusText);
          return false;
        } else {
          setTfaEnable(false);
          setFeedback('Two Factor Authentication disabled successfully.');
        }
      } catch (error) {
        console.error('Error generating 2FA QR Code:', error);
        return false;
      } finally {
        refetchTfaStatus();
        clearFeedbackError();
      }
    }
  };

  return (
    <div className="settings-container">
      <div className="item">
        <div className="text">
          <h4>Enable 2FA</h4>
        </div>
        <div className="Change2FA">
          <button
            type="button"
            className="TwoFA"
            onClick={tfaStatus ? handleDisable2FA : handleClick2FA}
          >
            <i className="bi bi-qr-code-scan fs-1"></i>
            <h6>{tfaStatus ? 'Disable' : 'Enable'} 2FA</h6>
          </button>
          {qrCodeUrl && (
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
          )}
        </div>
        {feedback && (
          <div className="text-dark">
            <p>{feedback}</p>
          </div>
        )}
      </div>
      {error && (
        <div className="error-bar">
          <p className="errortext">{error}</p>
        </div>
      )}
    </div>
  );
};

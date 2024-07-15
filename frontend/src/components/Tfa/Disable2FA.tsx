import { TFA_DISABLE } from '../../utils/constants';
import useStorage from '../../hooks/useStorage';
import { useGetTfaStatus } from '../../hooks/useGetTfaStatus';

export const Disable2FA = ({ setFeedback, setError, clearFeedbackError }) => {
  const [userIdStorage] = useStorage<string>('userId', '');
  const { refetch: refetchTfaStatus } = useGetTfaStatus(userIdStorage);

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
          })
        });
        if (!response.ok) {
          setError(response.statusText);
          return false;
        } else {
          setFeedback("Two Factor Authentication disabled successfully.");
        }
      } catch (error) {
        setError('Error disabling 2FA: ' + error);
        return false;
      } finally {
        refetchTfaStatus();
        clearFeedbackError();
      }
    }
  };

  return (
    <button type="button" className="TwoFA" onClick={handleDisable2FA}>
      <i className="bi bi-qr-code-scan fs-1"></i>
      <h4>Disable 2FA</h4>
    </button>
  );
};

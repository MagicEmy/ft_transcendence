import { useState, useEffect } from "react";
import { QrCodeGenerator } from "./QrCodeGenerator";
import { Enable2FA } from "./Enable2FA";
import { Disable2FA } from "./Disable2FA";
import { useGetTfaStatus } from "../../hooks/useGetTfaStatus";
import useStorage from "../../hooks/useStorage";

export const TwoFaEnable = () => {
  const [userIdStorage] = useStorage<string>('userId', '');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { tfaStatus, refetch: refetchTfaStatus } =
    useGetTfaStatus(userIdStorage);

  useEffect(() => {
    const fetchAndSetTfaStatus = async () => {
      await refetchTfaStatus();
    };
    fetchAndSetTfaStatus();
  }, [refetchTfaStatus]);

  const clearFeedbackError = () => {
    setTimeout(() => {
      setFeedback("");
      setError("");
    }, 5000);
  };

  return (
    <div className="settings-container">
      <div className="item">
        <div className="text">
          <h4>Enable 2FA</h4>
        </div>
        <div className="Change2FA">
          {tfaStatus ? (
            <Disable2FA
              setFeedback={setFeedback}
              setError={setError}
              clearFeedbackError={clearFeedbackError}
			  onSuccess={refetchTfaStatus}
            />
          ) : (
            <QrCodeGenerator
              setQrCodeUrl={setQrCodeUrl}
              setError={setError}
              clearFeedbackError={clearFeedbackError}
            />
          )}
          <Enable2FA
            qrCodeUrl={qrCodeUrl}
			setQrCodeUrl={setQrCodeUrl}
            clearFeedbackError={clearFeedbackError}
            setFeedback={setFeedback}
            setError={setError}
            onSuccess={refetchTfaStatus}
          />
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

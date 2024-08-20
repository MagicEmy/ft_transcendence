import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { TFA_VALIDATE } from '../../utils/constants';

import './TwoFa.css';

export const TwoFA = () => {
  const [tfaCode, setTfaCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const clearFeedbackError = () => {
    setTimeout(() => {
      setError('');
    }, 5000);
  };
  async function handleSubmit(event: FormEvent) {
    event?.preventDefault();
    const response = await fetch(TFA_VALIDATE, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        code: tfaCode,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 401) {
        setError('Incorrect authentication code. Please try again.');
      } else {
        setError(
          errorData.message || 'An error occurred. Please try again later.',
        );
      }
      clearFeedbackError();

      return false;
    }
    if (response.status === 200) navigate('/dashboard');
  }

  return (
    <div className="loginTfa">
      <div className="tfa-title">Two Factor Authentication</div>
      <form onSubmit={handleSubmit} className="tfa-form">
        <input
          className="input"
          placeholder="Enter 2FA Code..."
          type="text"
          value={tfaCode}
          onChange={(e) => setTfaCode(e.target.value)}
        />
        <button className="twoFaButton" type="submit">
          Submit Code
        </button>
      </form>
      {error && (
        <div className="error-bar">
          <p className="errortext">{error}</p>
        </div>
      )}
    </div>
  );
};
export default TwoFA;

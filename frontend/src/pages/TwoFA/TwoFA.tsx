import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import useStorage from '../../hooks/useStorage';
import { TFA_VALIDATE } from '../../utils/constants';

import './TwoFa.css';

export const TwoFA = () => {
  const [userIdStorage] = useStorage<string>('userId', '');

  const [tfaCode, setTfaCode] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorName, setErrorName] = useState('');
  const navigate = useNavigate();

  console.log('userIdStorage', userIdStorage);

  async function handleSubmit(event: FormEvent) {
    event?.preventDefault();
    console.log('userIdStorage', userIdStorage, 'tfaCode', tfaCode);
    const RESPONSE = await fetch(TFA_VALIDATE, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        code: tfaCode,
      }),
    });
    if (!RESPONSE.ok) {
      setErrorName(RESPONSE.statusText);
      setShowError(true);
      return false;
    }
    if (RESPONSE.status === 200) navigate('/dashboard');
    setShowError(false);
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
      {showError && (
        <div className="error-bar">
          <p className="errortext">{errorName}</p>
        </div>
      )}
    </div>
  );
};
export default TwoFA;

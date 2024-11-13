import React, { useEffect, useState, useMemo } from 'react';
import { LOGIN_AUTH0 } from '../../utils/constants';
import useStorage from '../../hooks/useStorage';
import './Login.css';

const Login: React.FC = () => {
  const [textArray, setTextArray] = useState<string[]>([]);
	const [ , setUserNameStorage] = useStorage<string>('userName', '');

	useEffect(() => {
		setUserNameStorage('');
	});


  useEffect(() => {
    const text = 'Enter the Pongverse';
    setTextArray(text.split(''));
  }, []);

  const animatedText = useMemo(
    () =>
      textArray.map((char, index) => (
        <span
          key={`char_${index}`}
          className="animate-text"
          style={{
            animationDelay: `${index * 0.1}s`,
            display: char === ' ' ? 'inline-block' : 'inline',
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      )),
    [textArray],
  );

  const handleLogin = async (): Promise<void> => {
    window.location.href = LOGIN_AUTH0;
  };

  return (
    <div className="login-container">
      <main className="login-main">
        <p className="pongverse-text" aria-label="Enter the Pongverse">
          {animatedText}
        </p>
        <button className="button-login" onClick={handleLogin}>
          LOGIN
        </button>
      </main>
    </div>
  );
};

export default Login;

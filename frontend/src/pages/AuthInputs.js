import { useState } from 'react';
import { styled } from 'styled-components';
import { NavLink } from 'react-router-dom';
import classes from '../components/MainNavigation.module.css';

import Button from './Button.js';
import Input from './Input.js';

const ControlContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`
;
const StyledNavLink = styled(NavLink)`
  padding: 1rem 2rem;
  font-weight: 600;
//   text-transform: uppercase;
  border-radius: 0.25rem;
  color: #1f2937;
  background-color: #871818;
  border-radius: 6px;
  border: none;
  text-decoration: none; /* Ensure NavLink behaves like a button */
  position: fixed;
  bottom: 300px; /* Adjust as needed */
  right: 550px; /* Adjust as needed */


  &:hover {
    background-color: #c74444;
  }
`;

export default function AuthInputs() {
  const [enteredEmail, setEnteredEmail] = useState('');
  const [enteredPassword, setEnteredPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleInputChange(identifier, value) {
    if (identifier === 'email') {
      setEnteredEmail(value);
    } else {
      setEnteredPassword(value);
    }
  }

  function handleLogin() {
    setSubmitted(true);
  }

  const emailNotValid = submitted && !enteredEmail.includes('@');
  const passwordNotValid = submitted && enteredPassword.trim().length < 6;

  return (
	<>
	<body className="login">
    <div id="auth-inputs">
      <ControlContainer>
        <Input
          label="Email"
          invalid={emailNotValid}
          type="email"
          // style={{
          //   backgroundColor: emailNotValid ? '#fed2d2' : '#d1d5db'
          // }}
          onChange={(event) => handleInputChange('email', event.target.value)}
        />
        <Input
          invalid={passwordNotValid}
          label="Password"
          type="password"
          onChange={(event) =>
            handleInputChange('password', event.target.value)
          }
        />
      </ControlContainer>
      <div className="actions">
        <button type="button" className="text-button">
          Create a new account
        </button>
        <Button onClick={handleLogin}>Sign In</Button>
      </div>
    </div>
	<nav>
		<StyledNavLink
			to="/events" 
			className={({isActive}) => 
			isActive ? classes.active : undefined
			} 
			> GoGoGo
		</StyledNavLink>
	</nav>
	</body>
	</>
  );
}

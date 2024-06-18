import { useState, FormEvent } from 'react'
import { useNavigate } from "react-router-dom";
import useStorage from '../../hooks/useStorage';

import { IUserContext } from '../../context/UserContext';
import { TFA_VALIDATE } from '../../utils/constants';

import './TwoFa.css'

export const TwoFA = () => {
	const [userIdStorage] = useStorage<string>('userId', '');

	const [tfaCode, setTfaCode] = useState('')
	const [showError, setShowError] = useState(false)
	const [errorName, setErrorName] = useState('')
	const navigate = useNavigate()

	async function handleSubmit(event: FormEvent) {
		event?.preventDefault();

		const RESPONSE = await fetch(TFA_VALIDATE, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'content-type': "application/json"
			},
			body: JSON.stringify({
				userId: userIdStorage,
				code: tfaCode,
			})
		});
		if (!RESPONSE.ok) {
			setErrorName(RESPONSE.statusText)
			setShowError(true);
			return (false);
		}
		if (RESPONSE.status === 200)
			navigate("/dashboard")
		setShowError(false);
	}

	/*
	const handleEnable2FA = async () => {
		console.log('Enabling 2FA...authCode', authCode, 'userIdContext', userIdStorage);
		if (authCode && userIdStorage) {
			try {
				const enableBody = {
					userId: userIdStorage,
					code: authCode,
				};
				const body = JSON.stringify(enableBody);
				const response = await fetch(TFA_ENABLE, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: body,
					credentials: 'include',
				});
				if (response.ok) {
					setTfaEnabled(true);
					setFeedback("Two Factor Authentication enabled successfully.");
				} else {
					const errorData = await response.json();
					console.error('Error enabling 2FA:', errorData.message);
					throw new Error(errorData.message || 'Invalid authentication code');
				}
			} catch (error) {
				console.error('Error enabling 2FA:', error);
				setErrorName('Error enabling 2FA:');
				setShowError(true);
				setFeedback("Failed to enable Two Factor Authentication.");
			}
		}
	};
	*/

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
			<button className="twoFaButton" type="submit">Submit Code</button>
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


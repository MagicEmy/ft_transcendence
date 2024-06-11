import React, { useState, FormEvent, useContext } from 'react'
import { useNavigate } from "react-router-dom";
import UserContext from '../../context/UserContext';
import { IUserContext } from '../../context/UserContext';
import { TFA_ENABLE } from '../../utils/constants';

import './TwoFa.css'

export const TwoFA = () => {
	const { userIdContext } = useContext<IUserContext>(UserContext);
	const [tfaCode, setTfaCode] = useState('')
	const [showError, setShowError] = useState(false)
	const [errorName, setErrorName] = useState('')
	const navigate = useNavigate()

	async function handleSubmit(event: FormEvent) {
		event?.preventDefault();

		const RESPONSE = await fetch(TFA_ENABLE, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'content-type': "application/json"
			},
			body: JSON.stringify({
				userId: userIdContext,
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


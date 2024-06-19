import { useState, useContext, useEffect } from 'react';
// import UserContext, { IUserContext } from '../context/UserContext';
import useStorage from '../hooks/useStorage';
import { TFA_QR, TFA_ENABLE } from '../utils/constants';
import { useGetTfaEnabled } from '../hooks/useGetTfaEnabled';


export const TwoFaEnable = () => {
	// const { userIdContext, setTfaEnabled, } = useContext<IUserContext>(UserContext);
	const [userIdStorage] = useStorage<string>('userId', '');
	const [userNameStorage] = useStorage<string>('userName', '');

	const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
	const [authCode, setAuthCode] = useState<string>('');
	const [showError, setShowError] = useState(false);
	const [error, setError] = useState('');
	const [feedback, setFeedback] = useState<string>('');
	const { tfaStatus } = useGetTfaEnabled(userIdStorage);
	console.log('tfaStatus', tfaStatus);

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
					})
				});
				console.log('response', response);
				if (!response.ok) {
					setError(response.statusText)
					setTimeout(() => {
						setError('');
					}, 5000);
					setShowError(true);
					return (false);
				}
				const text = await response.text();
				setQrCodeUrl(text);
			} catch (error) {
				console.error('Error generating 2FA QR Code:', error);
				setTimeout(() => {
					setError('');
				}, 5000);
				setShowError(true);
				return (false);
			}
		}
	};

	const handleEnable2FA = async () => {
		console.log('Enabling 2FA...authCode', authCode, 'userIdContext', userIdStorage);
		if (authCode && userIdStorage) {
			try {
				const response = await fetch(TFA_ENABLE, {
					method: 'POST',
					credentials: 'include',
					headers: {
						'content-type': "application/json"
					},
					body: JSON.stringify({
						userId: userIdStorage,
						code: authCode,
					})
				});
				if (response.ok) {
					console.log('2FA enabled successfully');
					setFeedback("Two Factor Authentication enabled successfully.");
					setTimeout(() => {
						setFeedback('');
					}, 5000);
				} else {
					const errorData = await response.json();
					console.error('Error enabling 2FA:', errorData.message);
					setError(`Error enabling 2FA: ${errorData.message}`);
					setTimeout(() => {
						setError('');
					}, 5000);
					setShowError(true);
					throw new Error(errorData.message || 'Invalid authentication code');
				}
			} catch (error) {
				console.error('Error enabling 2FA:', error);
				setError(`Failed to enable Two Factor Authentication.${error}`);
				setTimeout(() => {
					setError('');
				}, 5000);
				setShowError(true);
			}
		}
	};

	useEffect(() => {
		if (showError) {
			const timer = setTimeout(() => {
				setShowError(false);
			}, 5000);

			return () => clearTimeout(timer);
		}
	}, [showError]);

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
						onClick={handleClick2FA}
					>
						<i className="bi bi-qr-code-scan fs-1"></i>
						<h4>{tfaStatus ? "Disable" : "Enable"} 2FA</h4>
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
							// onClick={tfaStatus ? handleDisable2FA : handleEnable2FA}
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
			{showError && (
				<div className="error-bar">
					<p className="errortext">{error}</p>
				</div>
			)}
		</div>

	);
}

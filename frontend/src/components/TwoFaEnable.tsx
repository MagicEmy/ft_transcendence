import { useState, useContext } from 'react';
import UserContext, { IUserContext } from '../context/UserContext';
import useStorage from '../hooks/useStorage';
import { TFA_QR, TFA_ENABLE } from '../utils/constants';
import { useGetTfaEnabled } from '../hooks/useGetTfaEnabled';


export const TwoFaEnable = () => {
	const { userIdContext, setTfaEnabled, } = useContext<IUserContext>(UserContext);
	const [ userIdStorage ] = useStorage<string>('userId', '');

	const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
	const [authCode, setAuthCode] = useState<string>('');
	const [showError, setShowError] = useState(false);
	const [errorName, setErrorName] = useState('');
	const { tfaStatus } = useGetTfaEnabled(userIdStorage);
	// const { tfaStatus } = { tfaStatus: false };

	const handleClick2FA = async () => {
		if (userIdStorage) {
			try {
				const response = await fetch(TFA_QR, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ userId: userIdStorage }),
					credentials: 'include',
				});
				if (!response.ok) {
					setErrorName(response.statusText)
					setShowError(true);
					return (false);
				}
				const text = await response.text();
				setQrCodeUrl(text);
			} catch (error) {
				console.error('Error generating 2FA QR Code:', error);
			}
		}
	};

	const handleEnable2FA = async () => {
		console.log('Enabling 2FA...authCode', authCode, 'userIdContext', userIdStorage);
		if (authCode && userIdStorage) {
			try {
				const response = await fetch(TFA_ENABLE, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ userId: userIdContext, code: authCode }),
					credentials: 'include',
				});
				console.log('response', response);
				if (response.ok) {
					setTfaEnabled(true);
				} else {
					const errorData = await response.json();
					console.error('Error enabling 2FA:', errorData.message);
					throw new Error(errorData.message || 'Invalid authentication code');
				}
			} catch (error) {
				console.error('Error enabling 2FA:', error);
				setErrorName('Error enabling 2FA:');
				setShowError(true);
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
						className="settings-button"
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
							>
								Confirm 2FA
							</button>
						</div>
					)}
				</div>
			</div>
			{showError && (
				<div className="error2fa">
					<p className="errortext">{errorName}</p>
				</div>
			)}
		</div>

	);
}

import React, { useState, useEffect, useContext, ChangeEvent, FormEvent } from "react";
import UserContext, { IUserContext } from "../../context/UserContext";
import { useGetTfaEnabled } from "../../hooks/useGetTfaEnabled";
import { CHANGE_NAME, AVATAR, TFA_QR, TFA_ENABLE, TFA_DISABLE } from '../../utils/constants';
import useStorage from "../../hooks/useStorage";

import "./Settings.css";

const Settings = () => {
	const {
		userIdContext,
		userNameContext,
		setUserNameContext,
		avatarContext,
		setAvatarContext,
		tfaEnabled,
		setTfaEnabled,
	} = useContext<IUserContext>(UserContext);

	// const [userIdStorage, ,] = useStorage<string>('userId', '');
	const [, setUserNameStorage,] = useStorage<string>('userName', '');
	const [newUserName, setNewUserName] = useState<string>("");
	const [file, setFile] = useState<File | null>(null);
	const [avatarLoading, setAvatarLoading] = useState<boolean>(false);
	const [feedback, setFeedback] = useState<string>("");
	const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(false);
	const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
	const [authCode, setAuthCode] = useState<string>('');
	const [showError, setShowError] = useState(false)
	const [errorName, setErrorName] = useState('')

	const { tfaStatus } = useGetTfaEnabled(userIdContext);

	console.log("TFA Enabled:", tfaEnabled);
	console.log("TFA tfaStatus:", tfaStatus);

	const handleUserNameSubmit = async () => {
		if (newUserName && newUserName !== userNameContext) {
			try {
				const response = await fetch(CHANGE_NAME, {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						userId: userIdContext,
						userName: newUserName
					}),
					credentials: 'include'
				});

				if (response.ok) {
					setUserNameContext(newUserName);
					setUserNameStorage(newUserName);
					setFeedback("Username updated successfully.");
				} else {
					throw new Error('Failed to update username.');
				}
			} catch (error) {
				console.error("Error updating user data:", error);
				setFeedback("Failed to update username.");
			}
		}
	};

	const handleAvatarSubmit = async (event: FormEvent) => {
		event.preventDefault();
		setFeedback("");
		if (!file) {
			setFeedback("Please select a file to upload.");
			return;
		}

		const validTypes = ["image/jpeg", "image/png"];
		if (!validTypes.includes(file.type)) {
			setFeedback("Only JPG or PNG images are allowed.");
			return;
		}

		const maxSize = 500 * 1024; // 500KB
		if (file.size > maxSize) {
			setFeedback("The file size must be less than 500KB.");
			return;
		}

		setAvatarLoading(true);
		const formData = new FormData();
		formData.append("avatar", file);

		try {
			const response = await fetch(`${AVATAR}/${userIdContext}`, {
				method: 'PATCH',
				body: formData,
				credentials: 'include'
			});

			if (response.ok) {
				const localUrl = URL.createObjectURL(file);
				setAvatarContext(localUrl);
				setFeedback("Avatar updated successfully.");
			} else {
				setFeedback("Failed to update avatar. Please check the server response.");
			}
		} catch (error) {
			console.error("Error updating avatar:", error);
			setFeedback(`Error updating avatar: ${error}`);
		} finally {
			setAvatarLoading(false);
		}
	};

	useEffect(() => {
		return () => {
			if (avatarContext) {
				URL.revokeObjectURL(avatarContext);
			}
		};
	}, [avatarContext]);

	const handleClick2FA = async () => {
		if (userIdContext) {
			try {
				const response = await fetch(TFA_QR, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ userId: userIdContext }),
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
		console.log('Enabling 2FA...authCode', authCode, 'userIdContext', userIdContext);
		if (authCode && userIdContext) {
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
					setTwoFactorEnabled(true);
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
		<div className="main">
			<div className="settings">
				<h1 className="title">Settings</h1>
				<div className="flex">
					<div className="item">
						{avatarContext ? (
							<img className="avatar" src={avatarContext} alt="User Avatar" />
						) : (
							<p>Loading avatar...</p>
						)}
						<div className="item">Change Profile Picture:</div>
						<form onSubmit={handleAvatarSubmit}>
							<input
								type="file"
								onChange={(e: ChangeEvent<HTMLInputElement>) =>
									setFile(e.target.files ? e.target.files[0] : null)
								}
								disabled={avatarLoading}
							/>
							<br />
							<button type="submit" disabled={avatarLoading}>
								Upload New Profile Picture
							</button>
						</form>
					</div>

					<div className="item">
						<h3 className="text">{userNameContext}</h3>
						<div className="item">Change name:</div>
						<input
							type="text"
							placeholder="New Username..."
							onChange={(e: ChangeEvent<HTMLInputElement>) =>
								setNewUserName(e.target.value)
							}
							value={newUserName}
						/>
						<br />
						<button className="submit" onClick={handleUserNameSubmit}>Submit</button>
					</div>
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
											className="SubmitButton confirm-2fa"
											onClick={handleEnable2FA}
										>
											Confirm 2FA
										</button>
									</div>
								)}
							</div>
						</div>
						{showError && (
							<div className="error-bar">
								<p className="errortext">{errorName}</p>
							</div>
						)}
					</div>
					{feedback && (
						<div className="text-dark">
							<p>{feedback}</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Settings;

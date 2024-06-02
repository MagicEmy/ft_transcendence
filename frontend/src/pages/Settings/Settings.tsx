import React, { useState, useEffect, useContext, ChangeEvent, FormEvent } from "react";
import UserContext, { IUserContext } from "../../context/UserContext";
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

	const [newUserName, setNewUserName] = useState<string>("");
	const [file, setFile] = useState<File | null>(null);
	const [avatarLoading, setAvatarLoading] = useState<boolean>(false);
	const [feedback, setFeedback] = useState<string>("");
	const [, setTwoFactorEnabled] = useState<boolean>(false);

	console.log("TFA Enabled:", tfaEnabled);

	const handleUserNameSubmit = async () => {
		if (newUserName && newUserName !== userNameContext) {
			try {
				const response = await fetch(`http://localhost:3001/username`, {
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
			const response = await fetch(`http://localhost:3001/avatar/${userIdContext}`, {
				method: 'PATCH',
				body: formData,
				credentials: 'include'
			});

			if (response.ok) {
				const localUrl = URL.createObjectURL(file);
				setAvatarContext(localUrl);
				console.log("Local URL for preview:", localUrl);
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
				const response = await fetch('http://localhost:3003/auth/disabled2fa', {
					method: 'POST',
					credentials: 'include'
				});
				if (response.ok) {
					setTwoFactorEnabled(false);
					setTfaEnabled(false);
				} else {
					throw new Error('Error disabling 2FA');
				}
			} catch (error) {
				console.error('Error disabling 2FA:', error);
			}
		} else {
			window.location.href = 'http://localhost:3003/auth/create2fa';
			setTwoFactorEnabled(true);
			setTfaEnabled(true);
		}
	};

	return (
		<div className="main">
			<div className="profile">
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
						<button onClick={handleUserNameSubmit}>Submit</button>
					</div>
					<div className="item">
						<div className="Info2fa"><h4>Enable Two-Factor Authentication</h4></div>
						<div className="Change2FA">
							<button
								type="submit"
								className="SubmitButton TwoFA"
								onClick={handleClick2FA}
							>
								<i className="bi bi-qr-code-scan fs-1"></i>
								<h4>{tfaEnabled ? "Disable" : "Enable"} 2FA</h4>
							</button>
						</div>
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

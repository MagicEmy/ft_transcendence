import { useContext } from 'react';
import { AVATAR } from '../utils/constants';
import UserContext, { IUserContext } from '../context/UserContext';
import { useGetAvatar } from "../hooks/useGetAvatar";
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Avatar } from './Avatar';

export const ChangeAvatar = () => {
	const { userIdContext, avatarContext, setAvatarContext } = useContext<IUserContext>(UserContext);

	const [file, setFile] = useState<File | null>(null);
	// const [fileName, setFileName] = useState<string>("");
	const [feedback, setFeedback] = useState<string>("");
	const [avatarLoading, setAvatarLoading] = useState<boolean>(false);
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
				console.log("avatar change response.ok ");
				setAvatarContext(localUrl);
				//setAvatarContext(localUrl);
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

	return (
		<>
			<div className="item">
				<Avatar />
				<div className="text">Change Profile Picture:</div>
				<form onSubmit={handleAvatarSubmit}>
					<input
						type="file"
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							setFile(e.target.files ? e.target.files[0] : null)
						}
						disabled={avatarLoading}
					/>
					<br />
					<button type="submit" className="settings-button" disabled={avatarLoading}>
						Upload Picture
					</button>
				</form>
			</div>
			{feedback && (
				<div className="text-dark">
					<p>{feedback}</p>
				</div>
			)}
		</>
	);

};

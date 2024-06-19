import React, { ChangeEvent, useContext, useState } from 'react';
import { CHANGE_NAME } from '../utils/constants';
import useStorage from '../hooks/useStorage';
import UserContext, { IUserContext } from '../context/UserContext';


export const ChangeName = () => {
	const { userIdContext, userNameContext, setUserNameContext } = useContext<IUserContext>(UserContext);
	const [ , setUserNameStorage, ] = useStorage<string>('userName', '');
	const [newUserName, setNewUserName] = useState<string>('');
	const [feedback, setFeedback] = useState<string>('');

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

	return (
		<>
			<div className="item">
				<h3 className="text">{userNameContext}</h3>
				<div className="text">Change name:</div>
				<input
					type="text"
					placeholder="New Username..."
					onChange={(e: ChangeEvent<HTMLInputElement>) =>
						setNewUserName(e.target.value)
					}
					value={newUserName}
				/>
				<br />
				<button className="settings-button" onClick={handleUserNameSubmit}>Submit</button>
			</div>
			{feedback && (
				<div className="text-dark">
					<p>{feedback}</p>
				</div>
			)}
		</>
	);
};

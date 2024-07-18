import React, { ChangeEvent, useContext, useState } from 'react';
import { CHANGE_NAME } from '../utils/constants';
import useStorage from '../hooks/useStorage';
import UserContext, { IUserContext } from '../context/UserContext';


export const ChangeName = () => {
	const { userIdContext, userNameContext, setUserNameContext } = useContext<IUserContext>(UserContext);
	const [ , setUserNameStorage, ] = useStorage<string>('userName', '');
	const [newUserName, setNewUserName] = useState<string>('');
	const [feedback, setFeedback] = useState<string>('');

	const validateUserName = (userName:string ) => {
		const isValidLength = userName.length >= 2 && userName.length <= 15;
		const isAlphanumeric = /^[a-z0-9]+$/i.test(userName);
		return isValidLength && isAlphanumeric;
	};

	const clearFeedback = () => {
        setTimeout(() => {
            setFeedback('');
        }, 5000);
    };
	const handleUserNameSubmit = async () => {
		if (newUserName !== ''){
			if (!validateUserName(newUserName)) {
				setFeedback("Username must be between 2 and 15 characters and only contain alphanumeric characters.");
				clearFeedback();
				return;
			} else if (newUserName === userNameContext) {
				setFeedback("New username cannot be the same as the current username.");
				clearFeedback();
				return;
			}

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
					setNewUserName('');
				} else {
					const message = await response.json();
					setFeedback("Error updating username.");
					throw new Error(message.message);
				}
			} catch (error) {
				console.error("Error updating user data:", error);
				setFeedback(error + "");
			} finally {
				clearFeedback();
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

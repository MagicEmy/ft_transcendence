import React, { useState, useEffect } from 'react'
import LeaderboardProfiles from './LeaderboardProfiles';
import axios from "axios";
import "./Leaderboard.css";

export default function Leaderboard() {
	const [leaderboard, setLeaderboard] = useState();

	useEffect(() => {

		const fetcDbBoard = async () => {
			try {
				const response = await axios.get('http://localhost:3002/leaderboard', {
					withCredentials: true,
				});
				const leaderboardDB = response.data;
				setLeaderboard(leaderboardDB || []);
			} catch (error) {
				console.error("Error fetching user data:", error);
				setLeaderboard([]);
			}
		};
		fetcDbBoard();
	}, []);

	useEffect(() => {
	}, [leaderboard]);

	return (
		<div className="App" id='main'>
			<div className="board">
				<h1 className='leaderboard'>Leaderboard</h1>
				<LeaderboardProfiles leaderboard={(leaderboard)}></LeaderboardProfiles>

			</div>
		</div>
	)
}


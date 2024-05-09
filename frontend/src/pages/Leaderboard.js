import React, { useState, useEffect, useContext } from 'react'
import LeaderboardProfiles from './LeaderboardProfiles';
// import { LeaderboardDB } from './database';
import AuthContext from "../context/AuthContext";
import axios from "axios";
import "./Leaderboard.css";

export default function Leaderboard() {
	const [leaderboard, setLeaderboard] = useState();
	const { authToken } = useContext(AuthContext);

	useEffect(() => {
		if (authToken) {
			console.log("authToken", authToken);
			const fetcDbBoard = async () => {
				try {
					const response = await axios.get(
						'http://localhost:3002/leaderboard', {
						headers: {
							Authorization: `Bearer ${authToken}`,
						},
						withCredentials: true,
					});
					const leaderboardDB = response.data;
					setLeaderboard(leaderboardDB || []);
					console.log("LOOK Leaderboard data:", leaderboard);
				} catch (error) {
					console.error("Error fetching user data:", error);
					setLeaderboard([]);
				}
			};
			fetcDbBoard();
		} else {
			console.log("No leaderboard data");
		}
	}, [authToken]);

	useEffect(() => {
		console.log("Updated Leaderboard data:", leaderboard);
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


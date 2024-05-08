import React, { useState, useEffect, useContext } from 'react'
import Profiles from './MockProfiles';
import { LeaderboardDB } from './database';
import AuthContext from "../context/AuthContext";
import axios from "axios";


export default function Board() {
	const [leaderboard, setLeaderboard] = useState();
	const { authToken } = useContext(AuthContext);

	useEffect(() => {
		if (authToken) {
		  const fetcDbBoard = async () => {
			try {
			  const response = await axios.get(
				'http://localhost:3002/stats/leaderboard',
				{
				  headers: { Authorization: `Bearer ${authToken}` },
				}
			  );
			  const leaderboardDB = response.data;
			  setLeaderboard(leaderboardDB);
			  console.log("HERE dbProfile: ", leaderboard);
			} catch (error) {
			  console.error("Error fetching user data:", error);
			}
		  };
		  fetcDbBoard();
		} else {
		  console.log("No leaderboard data");
		}
	  }, []);

  return (
    <div className="board">
        <h1 className='leaderboard'>Leaderboard</h1>
        <Profiles LeaderboardDB={(LeaderboardDB)}></Profiles>

    </div>
  )
}


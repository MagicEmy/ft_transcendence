import { useState, useEffect } from 'react';
import LeaderboardProfiles from './LeaderboardProfiles';
import { useNewUserStatus } from '../../hooks';

import { LeaderboardStats } from './types';
import { LEADERBOARD } from '../../utils/constants';
import "./Leaderboard.css";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardStats[]>([]);
  useNewUserStatus('online');

  useEffect(() => {
    const fetchDbBoard = async () => {
      try {
				const response = await fetch(LEADERBOARD, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json'
					},
					credentials: 'include'
				});

        const leaderboardDB: LeaderboardStats[] = await response.json();
        setLeaderboard(leaderboardDB || []);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLeaderboard([]);
      }
    };

    fetchDbBoard();
  }, [setLeaderboard]);

  return (
    <div className="App" id='main'>
      <div className="board">
        <h1 className='leaderboard'>Leaderboard</h1>
        <LeaderboardProfiles leaderboard={leaderboard}></LeaderboardProfiles>
      </div>
    </div>
  );
};

export default Leaderboard;

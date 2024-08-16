import { useState, useEffect } from 'react';
import LeaderboardProfiles from './LeaderboardProfiles';
import { useUpdateStatus } from '../../hooks';
import { LeaderboardStats } from './types';
import { LEADERBOARD } from '../../utils/constants';
import './Leaderboard.css';

const Leaderboard = () => {
  useUpdateStatus();
  const [leaderboard, setLeaderboard] = useState<LeaderboardStats[]>([]);

  useEffect(() => {
    const fetchDbBoard = async (retry = 1) => {
      try {
        const response = await fetch(LEADERBOARD, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (!response.ok) {
          if (response.status === 400 && retry > 0) {
            return fetchDbBoard(retry - 1);
          } else {
            throw new Error('Failed to fetch leaderboard data.');
          }
        }
        const leaderboardDB: LeaderboardStats[] = await response.json();
        setLeaderboard(leaderboardDB || []);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLeaderboard([]);
      }
    };

    fetchDbBoard();
  }, [setLeaderboard]);

  return (
    <div className="App" id="main">
      <div className="board">
        <h1 className="leaderboard">Galactic Leaderboard</h1>
        <LeaderboardProfiles leaderboard={leaderboard}></LeaderboardProfiles>
      </div>
    </div>
  );
};

export default Leaderboard;

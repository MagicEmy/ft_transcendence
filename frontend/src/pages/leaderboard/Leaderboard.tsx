import React, { useState, useEffect } from 'react';
import LeaderboardProfiles from './LeaderboardProfiles';
import { LeaderboardStats } from './types';
import "./Leaderboard.css";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardStats[]>([]);

  useEffect(() => {
    const fetchDbBoard = async () => {
      try {
        const response = await fetch('http://localhost:3002/leaderboard', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Error fetching leaderboard: ${response.statusText}`);
        }

        const leaderboardDB: LeaderboardStats[] = await response.json();
        setLeaderboard(leaderboardDB || []);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLeaderboard([]);
      }
    };

    fetchDbBoard();
  }, []);

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

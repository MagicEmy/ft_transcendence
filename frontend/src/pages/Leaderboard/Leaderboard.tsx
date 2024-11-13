import { useState, useEffect } from 'react';
import LeaderboardProfiles from './LeaderboardProfiles';
import { useUpdateStatus } from '../../hooks';
import { LeaderboardStats } from './types';
import Error from '../Error/Error';
import { LEADERBOARD } from '../../utils/constants';
import './Leaderboard.css';

const Leaderboard = () => {
  useUpdateStatus();
  const [leaderboard, setLeaderboard] = useState<LeaderboardStats[]>([]);
  const [error, setError] = useState<number | null>(null);

  useEffect(() => {
    const fetchDbBoard = async (retry = 2) => {
      setError(null);

      try {
        const response = await fetch(LEADERBOARD, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (!response.ok) {
          if (response.status === 401 && retry > 0) {
            return fetchDbBoard(retry - 1);
          } else {
            setError(response.status);
            setLeaderboard([]);
          }
        }
        const leaderboardDB: LeaderboardStats[] = await response.json();
        setLeaderboard(leaderboardDB || []);
      } catch (error) {
				setError(error as number);
        setLeaderboard([]);
      }
    };

    fetchDbBoard();
  }, [setLeaderboard]);

  if (error) {
    return <Error status={error} />;
  }
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

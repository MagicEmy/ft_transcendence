import React, { useState, useEffect } from 'react';
import { NavLink } from "react-router-dom";
import { loadProfileAvatar } from '../../utils/profileUtils';
import { LeaderboardStats } from './types';
import classes from "./Leaderboard.css";

interface LeaderboardProfilesProps {
  leaderboard: LeaderboardStats[];
}

const LeaderboardProfiles = ({ leaderboard }: LeaderboardProfilesProps) => {
  console.log("Leaderboard data:", leaderboard);
  return (
    <div id="leadProfile">
      {leaderboard && Array.isArray(leaderboard) ? <Item leaderboard={leaderboard} /> : <p>No leaderboard data available.</p>}
    </div>
  );
};

interface ItemProps {
  leaderboard: LeaderboardStats[];
}

const Item = ({ leaderboard }: ItemProps) => {
  const [avatars, setAvatars] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    leaderboard.forEach(async (user) => {
      const avatarUrl = await loadProfileAvatar(user.user_id);
      setAvatars(prev => ({ ...prev, [user.user_id]: avatarUrl || ''}));
    });
  }, [leaderboard]);

  return (
    <>
      {leaderboard?.map((value, index) => (
        <div className="flex" key={index}>
          <div className="item">
            <img src={avatars[value.user_id] || 'https://loremflickr.com/200/200/dog'} alt="" />
            <div className="info">
              <NavLink
                to={`/profile/${value.user_id}`} className={({ isActive }) =>
                  isActive ? classes.active : undefined
                } >
                <h3 className='name text-dark'>{value.user_name}</h3>
              </NavLink>
              <span className="total-points">Total points: {value.points}</span>
              <div className="stats">
                <span className="stat">Wins: <strong>{value.wins}</strong></span>
                <span className="stat">Losses: <strong>{value.losses}</strong></span>
                <span className="stat">Draws: <strong>{value.draws}</strong></span>
              </div>
            </div>
          </div>
          <span className="item">
            <span>{value.rank}</span>
          </span>
        </div>
      ))}
    </>
  );
};

export default LeaderboardProfiles;

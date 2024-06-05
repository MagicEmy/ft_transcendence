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
      const avatarUrl = await loadProfileAvatar(user.userId);
      setAvatars(prev => ({ ...prev, [user.userId]: avatarUrl || ''}));
    });
  }, [leaderboard]);

  return (
    <>
      {leaderboard?.map((value, index) => (
        <div className="flex" key={index}>
          <div className="item">
            <img src={avatars[value.userId] || 'https://loremflickr.com/200/200/dog'} alt="" />
            <div className="info">
              <NavLink
                to={`/profile/${value.userId}`} className={({ isActive }) =>
                  isActive ? classes.active : undefined
                } >
                <h3 className='text'>{value.userName}</h3>
              </NavLink>
              <span className="points">Total points:{value.pointsTotal}</span>
              <div className="stats">
                <span className="stat"><strong>{value.wins}</strong>Wins</span>
                <span className="stat"><strong>{value.draws}</strong>Draws</span>
                <span className="stat"><strong>{value.losses}</strong>Losses</span>
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

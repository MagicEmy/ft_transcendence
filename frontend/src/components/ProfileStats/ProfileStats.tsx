import React, { useContext } from 'react';
import { useGetProfile } from '../../hooks';
import { NavLink, useParams } from 'react-router-dom';
import UserContext, { IUserContext } from '../../context/UserContext';

import GamesAgainstBotStats from './GamesAgainstBot';
import GamesAgainstPlayersStats from './GamesAgainstPlayers';

export const UserStats = () => {
  const { userIdContext } = useContext<IUserContext>(UserContext);
  const { userId } = useParams<{ userId?: string }>();
  const userIdOrMe = userId || userIdContext;
  const { profile } = useGetProfile(userIdOrMe);
  const profileName = profile?.userInfo?.userName;
//   const isBot = profileName === 'bot';

  return (
    <div className="info">
      <div className="stats">
        <h4 className='profile-text-dark'>Leaderboard position: <span className="stat"><strong>{profile?.leaderboard?.position}</strong>of</span><strong>{profile?.totalPlayers}</strong></h4>
        <span className="stat">Total points: <strong>{profile?.leaderboard?.totalPoints}</strong></span>
        <h4 className='profile-text-dark'>Most frequent Opponent</h4>
		{profile && profile.mostFrequentOpponent?.length > 0 ? profile.mostFrequentOpponent?.map((opponent) => (
		// {profile && profile.mostFrequentOpponent?.length > 0 && !isBot ? profile.mostFrequentOpponent?.map((opponent) => (
          <div key={opponent.userId}>
            <div className="stat-column"></div>
            <NavLink to={`/profile/${opponent.userId}`}>{opponent.userName}</NavLink>
          </div>
        )) : <span className="stat">No games played yet</span>}
        <h4 className='profile-text-dark'>Games Against players</h4>
		<GamesAgainstPlayersStats profile={profile} />
        <h4 className='profile-text-dark'>Games Against bot</h4>
        <GamesAgainstBotStats profile={profile} />
      </div>

    </div>
  );

};

import React from 'react';
import { useGetProfile } from '../hooks';
import { NavLink, useParams } from 'react-router-dom';
import useStorage from '../hooks/useStorage';
import GamesAgainstBotStats from './GamesAgainstBot';

export const UserStats = () => {
  const { userId } = useParams<{ userId?: string }>();
  const [userIdStorage, ,] = useStorage<string>('userId', '');
  const userIdOrMe = userId || userIdStorage;
  const { profile } = useGetProfile(userIdOrMe)

  return (
    <div className="info">
      <div className="stats">
        <h4 className='profile-text-dark'>Leaderboard position: <span className="stat"><strong>{profile?.leaderboard?.position}</strong>of</span><strong>{profile?.totalPlayers}</strong></h4>
        <span className="stat">Total points: <strong>{profile?.leaderboard?.totalPoints}</strong></span>
        <h4 className='profile-text-dark'>Most frequent Opponent</h4>
        {profile && profile.mostFrequentOpponent.length > 0 ? profile.mostFrequentOpponent?.map((opponent) => (
          <div key={opponent.userId}>
            <div className="stat-column"></div>
            <NavLink to={`/profile/${opponent.userId}`}>{opponent.userName}</NavLink>
          </div>
        )) : <span className="stat">No games played yet</span>}
        <h4 className='profile-text-dark'>Games Against players</h4>
        <div className="stat-column">
          <span className="stat">Total played games <strong>{profile?.gamesAgainstHuman?.totalPlayedGames}</strong></span>
          <span className="stat">High score <strong>{profile?.gamesAgainstHuman?.maxScore}</strong></span>
        </div>
        <span className="stat"><strong>{profile?.gamesAgainstHuman?.wins}</strong>Wins</span>
        <span className="stat"><strong>{profile?.gamesAgainstHuman?.draws}</strong>Draws</span>
        <span className="stat"><strong>{profile?.gamesAgainstHuman?.losses}</strong>Losses</span>

        <h4 className='profile-text-dark'>Total time played against players</h4>
        <div className="item info">
          {profile && profile?.gamesAgainstHuman?.totalTimePlayed?.weeks > 0 ? <span className="stat"><strong>{profile?.gamesAgainstHuman?.totalTimePlayed?.weeks}</strong>Weeks</span> : null}
          {profile && profile?.gamesAgainstHuman?.totalTimePlayed?.days > 0 ? <span className="stat"><strong>{profile?.gamesAgainstHuman?.totalTimePlayed?.days}</strong>Days</span> : null}
          <span className="stat"><strong>{profile?.gamesAgainstHuman?.totalTimePlayed?.hours}</strong>Hours</span>
          <span className="stat"><strong>{profile?.gamesAgainstHuman?.totalTimePlayed?.minutes}</strong>Minutes</span>
          <span className="stat"><strong>{profile?.gamesAgainstHuman?.totalTimePlayed?.seconds}</strong>Seconds</span>
        </div>
        <h4 className='profile-text-dark'>Games Against bot</h4>
        <GamesAgainstBotStats profile={profile} />
      </div>

    </div>
  );

};

import React, { useContext } from "react";
import { useGetProfile } from "../../hooks";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import UserContext, { IUserContext } from "../../context/UserContext";

import GamesAgainstBotStats from "./GamesAgainstBot";
import GamesAgainstPlayersStats from "./GamesAgainstPlayers";

export const UserStats = () => {
  const { userIdContext } = useContext<IUserContext>(UserContext);
  const navigate = useNavigate();

  const { userId } = useParams<{ userId?: string }>();
  const userIdOrMe = userId || userIdContext;
  const { profile } = useGetProfile(userIdOrMe);

  return (
    <div className="info">
      <div className="stats">
        <h4 className="profile-text-dark">
          Leaderboard position:{" "}
          <span className="stat">
            <strong>{profile?.leaderboard?.position}</strong>of
          </span>
          <strong>{profile?.totalPlayers}</strong>
        </h4>
        <span className="stat">
          Total points: <strong>{profile?.leaderboard?.totalPoints}</strong>
        </span>
        <h4 className="profile-text-dark">Most frequent Opponent</h4>
        {profile && profile.mostFrequentOpponent?.length > 0 ? (
          profile.mostFrequentOpponent?.map((opponent) => (
            <div key={opponent.userId}>
              <div className="stat-column"></div>
			  {opponent.userName === 'bot' && !opponent.userId ? (
				<div className="opponents-bot">{opponent.userName}</div>
			  ) : (
				<div
                onClick={() => {
                  navigate(`/profile/${opponent.userId}`);
                  window.scrollTo(0, 0);
                }}
                className="opponents"
              >
                {opponent.userName}
              </div>
			  )}
             
            </div>
          ))
        ) : (
          <span className="stat">No games played yet</span>
        )}
        <h4 className="profile-text-dark">Games Against players</h4>
        <GamesAgainstPlayersStats profile={profile} />
        <h4 className="profile-text-dark">Games Against bot</h4>
        <GamesAgainstBotStats profile={profile} />
      </div>
    </div>
  );
};

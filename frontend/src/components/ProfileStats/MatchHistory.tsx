import React from 'react';
import { useGetMatchHistory } from '../../hooks';

export const MatchHistory = ({ userId }: { userId: string }) => {
  const { games } = useGetMatchHistory(userId);

  if (!games) return null;

  return (
    <div>
      <div className="userMatchHistory">
        <h4 className="title">Match History</h4>
        {games.length > 0 ? (
          <ul>
            {games.map((game) => (
              <li key={game.gameId}>
                <div className="gameHistory">
                  <span className="player-info">
                    <span className="player-name">{game.player1Name}</span>
                    <span className="player-score">{game.player1Score}</span>
                  </span>
                  <span className="separator">-</span>
                  <span className="player-info">
                    <span className="player-score">{game.player2Score}</span>
                    <span className="player-name">{game.player2Name}</span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="gameHistory">
            <span className="player-info">No games played yet</span>
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { useParams, NavLink } from "react-router-dom";
import useStorage from '../hooks/useStorage';
import { useGetMatchHistory } from '../hooks';


export const MatchHistory = ({ userId }: { userId: string }) => {

  const { games } = useGetMatchHistory(userId);

  if (!games) return null;

  return <div>
    {games.length > 0 ? (
      <div className="games">
        <h4 className='title'>Match History</h4>
        <ul>
          {games.map((game) => (
            <li>
              <div className="gameHistory">
                <div className="stats">
                  <span className="player-name">{game.player1Name} {game.player1Score} : </span>
                  <span className="player-name">{game.player2Score} {game.player2Name}</span>
                  {/* <span className="player-score">{game.player1Score}</span> */}
                </div>
                <div className="player">
                  {/* <span className="player-name">{game.player2Name} {game.player2Score}</span> */}
                  {/* <span className="player-score">{game.player2Score}</span> */}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    ) : (
      <div className="games">
        <span className="statsGames">No games played yet</span>
      </div>
    )}
  </div>
};

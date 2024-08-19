import React, { useContext, useEffect, useState } from 'react';
import { Button, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ChatContext } from '../../context/ChatContext';
import { ChatContextType, GameDto, GameInvitationDto, GameInvitationtype, UserDto } from '../../types/chat.dto';
import useStorage from '../../hooks/useStorage';
import './GameInvitation.css';

interface GameInvitationProps {
  userToInvite: UserDto | null;
  onInvitationSent: () => void;
}

function GameInvitation({ userToInvite, onInvitationSent }: GameInvitationProps) {
  const [userIdStorage] = useStorage<string>("userId", "");
  const [userNameStorage] = useStorage<string>("userName", "");
  const user: UserDto = { userId: userIdStorage, userName: userNameStorage };
  const context = useContext(ChatContext) as ChatContextType;
  const { socket } = context;
  const [gameInvite, setGameInvite] = useState<GameDto | {}>({});

  useEffect(() => {
    socket.on("game_invitation", handleGameInvitation);
    return () => {
      socket.off("game_invitation", handleGameInvitation);
    };
  }, [socket]);

  useEffect(() => {
    if (userToInvite) {
      handleSendInvitation();
    }
  }, [userToInvite]);

  const handleGameInvitation = (payload: GameDto) => {
    if (payload.type === "Remove") {
      setGameInvite({}); 
    } else {
      setGameInvite(payload);
    }
  };

  const handleSendInvitation = () => {
    if (!userToInvite) return;
    const gameInvitationDto: GameInvitationDto = {
      sender: user,
      receiver: userToInvite,
      type: GameInvitationtype.SEND
    };
    socket.emit("game_invitation", gameInvitationDto);
    onInvitationSent();
  };

  const gameInvitation = (type: GameInvitationtype) => {
    if (!('user' in gameInvite)) return;
    const gameInvitationDto: GameInvitationDto = {
      sender: user,
      receiver: gameInvite.user,
      type: type
    };
    socket.emit("game_invitation", gameInvitationDto);
    if (type === GameInvitationtype.DECLINE) {
      setGameInvite({});
    }
  };

  if (Object.keys(gameInvite).length === 0 || !('type' in gameInvite)) {
    return null;
  }

  return (
    <div className="game-invitation">
      <h4 className="game-invitation-heading">Game Invite</h4>
      <ListGroup>
        <ListGroup.Item>
          <span className="inviter-name">{gameInvite.user?.userName}</span>
          {gameInvite.type === "invitation" && (
            <div className="invitation-actions">
              <Button 
                variant="success" 
                onClick={() => gameInvitation(GameInvitationtype.ACCEPT)}
                className="action-button accept-button"
              >
                Accept
              </Button>
              <Button 
                variant="danger" 
                onClick={() => gameInvitation(GameInvitationtype.DECLINE)}
                className="action-button decline-button"
              >
                Decline
              </Button>
            </div>
          )}
          {gameInvite.type === "host" && (
            <Button 
              variant="danger" 
              onClick={() => gameInvitation(GameInvitationtype.DECLINE)}
              className="action-button decline-button"
            >
              Cancel
            </Button>
          )}
          {gameInvite.type === "start the game" && (
            <Link to="/game" className="btn btn-info action-button">
              Go to Game
            </Link>
          )}
        </ListGroup.Item>
      </ListGroup>
    </div>
  );
}

export default GameInvitation;
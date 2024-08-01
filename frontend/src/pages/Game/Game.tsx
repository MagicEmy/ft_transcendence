import React, { useEffect, useRef } from 'react';
import useStorage from "../../hooks/useStorage";
import { useNewUserStatus } from '../../hooks';

import GameSocket from './GameSocket';
import GameEventListener from './GameEventListener';
import GameGraphics from './GameGraphics';

import './Game.css';
import GameLogic from './GameLogic';

const Game: React.FC = () => {
	const socket = useRef<GameSocket | null>(null);
	const logic = useRef<GameLogic | null>(null);
	const graphics = useRef<GameGraphics | null>(null);
	const events = useRef<GameEventListener | null>(null);
	const [userIdStorage, , ] = useStorage<string>('userId', '');
  	const [userNameStorage, , ] = useStorage<string>('userName', '');
	useNewUserStatus('playing');

	useEffect(() => {
		if (socket.current === null)
			socket.current = GameSocket.createInstance(userIdStorage, userNameStorage);
		if (logic.current === null)
			logic.current = GameLogic.getInstance();
		if (graphics.current === null)
			graphics.current = GameGraphics.getInstance();
		if (events.current === null)
			events.current = new GameEventListener();

		if (graphics.current !== null)
			graphics.current.resizeElements();
		if (logic.current !== null)
			logic.current.UpdateGraphics();

		return () => {
			if (socket.current)
				socket.current.disconnect();
			if (events.current)
				events.current.stopListening();
		};
	}, []);

	return (
		<div id="game">
			<canvas id="gameBackground"></canvas>
			<canvas id="gameCanvas"></canvas>
			<canvas id="gameHUD"></canvas>
			<canvas id="gameMenu"></canvas>
		</div>
	);
}

export default Game;


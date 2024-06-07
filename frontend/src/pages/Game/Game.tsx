import React, { useEffect, useRef, useContext } from 'react';
import UserContext, { IUserContext } from "../../context/UserContext";

import GameSocket from './GameSocket';
import GameEventListener from './GameEventListener';
import GameGraphics from './GameGraphics';

import './GameCss.css';

const Game: React.FC = () => {
	const socket = useRef<GameSocket | null>(null);
	const graphics = useRef<GameGraphics | null>(null);
	const events = useRef<GameEventListener | null>(null);
	const { userIdContext, userNameContext } = useContext<IUserContext>(UserContext);

	console.log(`this is my infos /${userIdContext}/${userNameContext}/`)

	useEffect(() => {
		if (socket.current === null)
			socket.current = GameSocket.createInstance(userIdContext);
		if (graphics.current === null)
			graphics.current = GameGraphics.getInstance();
		if (events.current === null)
			events.current = new GameEventListener();

		if (graphics.current !== null)
			graphics.current.resizeElements();

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


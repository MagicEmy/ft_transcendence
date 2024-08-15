import React, { useEffect, useRef } from 'react';
import useStorage from "../../hooks/useStorage";

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

	  const gameRef = useRef<HTMLDivElement>(null);
	  const backRef = useRef<HTMLCanvasElement>(null);
	  const canvRef = useRef<HTMLCanvasElement>(null);
	  const hudRef = useRef<HTMLCanvasElement>(null);
	  const menuRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (socket.current === null)
			socket.current = GameSocket.createInstance(userIdStorage, userNameStorage);
		if (logic.current === null)
			logic.current = GameLogic.getInstance();
		if (graphics.current === null)
			graphics.current = GameGraphics.CreateInstance(gameRef.current, backRef.current, canvRef.current, hudRef.current, menuRef.current);
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
		<div id="game" ref={gameRef}>
			<canvas id="gameBackground" ref={backRef}></canvas>
			<canvas id="gameCanvas" ref={canvRef}></canvas>
			<canvas id="gameHUD" ref={hudRef}></canvas>
			<canvas id="gameMenu" ref={menuRef}></canvas>
		</div>
	);
}

export default Game;


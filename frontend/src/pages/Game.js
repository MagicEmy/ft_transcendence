import Canvas from '../containers/Canvas/Canvas';
import { styled } from 'styled-components';
import React, { useEffect } from 'react';
import io from 'socket.io-client';

const GameStyle = styled.div`
	// width: 100px;
	height: 700px;
	width: 100%;
	max-width: 80rem;
	padding: 2rem;
	margin: 0 auto;
	border-radius: 0.5rem;
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
	background: #066d0d;
`

function Game()
{
	//   const draw = (context,count) => {
	//     context.clearRect(0, 0, context.canvas.width, context.canvas.height)
	//     context.fillStyle = 'grey'
	//     const d = count % 800
	//     context.fillRect(10 +d , 10  , 100 , 100)
	//   }
	const draw = (context, count) =>
	{
		context.clearRect(0, 0, context.canvas.width, context.canvas.height)
		context.fillStyle = 'white'
		const d = count % 800
		context.beginPath();
		context.arc(10 + d, 10, 50, 0, Math.PI * 2, false);
		context.fill();
	};

	useEffect(() =>
	{
		console.log("trying to connect...");
		const socket = io("http://localhost:3006");

		socket.on("connect", () =>
		{
			console.log("Socket.IO connection established");

			const connectMSG =
			{
				client:		window.location.hostname,
				name:		window.location.hostname,
				msgType:	"connection"
				// callback:	() =>
				// {
				// 	console.log("Callback");
				// },
			}
			console.log("Sending user Package to Game");
			socket.emit("connectMSG", JSON.stringify(connectMSG));
			socket.emit("test");
		});

		socket.on("disconnect", () =>
		{
			// socket.emit("disconnect");
			socket.disconnect();
			console.log("Socket.IO connection closed");
		});

		socket.on("error", (message) =>
		{
			console.error("Socket.IO error: ", message);
		});

		socket.on("pong", (message) =>
		{
			console.log("received: ", message);
		})

		const HandleKeyEvent = (event) =>
		{
			const eventData = {
				code:	event.keyCode,
				name:	event.key,
				press:	event.type,
				event:	event.event,
			};
			console.log("Sending: ", eventData);
			socket.emit("button", JSON.stringify(eventData));
		};
	
		document.addEventListener('keydown', HandleKeyEvent);
		document.addEventListener('keyup', HandleKeyEvent);

		const getImage = () =>
		{
			console.log("requesting Image!");
			socket.emit("image");
		};
		const gameInterval = setInterval(getImage, 1000);

		return () =>
		{
			clearInterval(gameInterval);
			socket.disconnect();
		}
	}, []);



	return (
		<>
			<GameStyle>
				<div className="canvas-container">
					{/* <GameConnect></GameConnect> */}
					{/* <Canvas draw={draw} width="800" height="400" /> */}
				</div>
			</GameStyle>
		</>
	);
}

export default Game;

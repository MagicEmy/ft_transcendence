import { styled } from 'styled-components';
import React, { useEffect } from 'react';
import io from 'socket.io-client';

import './game.css';

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

// function test()
// {

// }

function Game()
{
	//   const draw = (context,count) => {
	//     context.clearRect(0, 0, context.canvas.width, context.canvas.height)
	//     context.fillStyle = 'grey'
	//     const d = count % 800
	//     context.fillRect(10 +d , 10  , 100 , 100)
	//   }
	// const draw = (context, count) =>
	// {
	// 	context.clearRect(0, 0, context.canvas.width, context.canvas.height)
	// 	context.fillStyle = 'white'
	// 	const d = count % 800
	// 	context.beginPath();
	// 	context.arc(10 + d, 10, 50, 0, Math.PI * 2, false);
	// 	context.fill();
	// };

	useEffect(() =>
	{
/* ************************************************************************** *\

	Variables

\* ************************************************************************** */

		const	GAMEelement = document.getElementById("game");
		const	BCKelement = document.getElementById("gameBackground");
		const	BCKcontext = BCKelement.getContext("2d");
		const	PONGelement = document.getElementById("gamePongCanvas");
		const	PONGcontext = PONGelement.getContext("2d");
		const	HUDelement = document.getElementById("gameHUD");
		const	HUDcontext = HUDelement.getContext("2d");
		const	font = "Arial";

		let	menuActive = true;
		let	hudType = 0;
		let	menuSelect = 0;
		let	menuList =
		[
			"Solo Game",
			"Find Match",
			"Infinite Load",
			"Exit",
		];

		handleResizeEvent();

/* ************************************************************************** *\

	Websockets

\* ************************************************************************** */

		console.log("trying to connect...");
		const socket = io("http://localhost:3006");

		socket.on("connect", () =>
		{
			console.log("Socket.IO connection established");

			// const connectMSG =
			// {
			// 	client:		window.location.hostname,
			// 	name:		window.location.hostname,
			// 	// msgType:	"connection"
			// 	msgType:	"solo",
			// 	// msgType:	"paired",
			// 	// msgType:	"match",
			// 	// callback:	() =>
			// 	// {
			// 	// 	console.log("Callback");
			// 	// },
			// }
			// // const connectMSG =
			// // {
			// // 	client
			// // }
			// console.log("Sending user Package to Game");
			// socket.emit("connectMSG", JSON.stringify(connectMSG));
			// socket.emit("test");
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
			// renderBackground();
			renderPong(message);
			// context.fillStyle = "rgba(23, 23, 23, 0.99)";
			// context.fillRect(0, 0, gameDiv.width, gameDiv.height);
			// console.log("received: ", message);
			// renderHUD(message);
		});

		socket.on("pongHUD", (message) =>
		{
			// console.log("hud ", hudType);
			hudType = 3;
			renderHUD(message);
			// console.log("hud ", hudType);
			// renderMenu();
		});

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
			menuKeyEvent(event.keyCode, event.type);
			renderHUD();
		};
		document.addEventListener('keydown', HandleKeyEvent);
		document.addEventListener('keyup', HandleKeyEvent);

/* ************************************************************************** *\

	Connect

\* ************************************************************************** */

		function	connectToServer(msgType)
		{
			if (msgType !== undefined)
			{
				const connectMSG =
				{
					client:	window.location.hostname,
					id:	window.location.hostname,
					msgType:	msgType,
				}
				socket.emit("connectMSG", JSON.stringify(connectMSG));
			}
		}

/* ************************************************************************** *\

	Canvas'

\* ************************************************************************** */

		// handleResizeEvent();

		window.addEventListener("resize", handleResizeEvent);
		function handleResizeEvent(event)
		{
			adjustSize(GAMEelement, BCKelement);
			adjustSize(GAMEelement, PONGelement);
			adjustSize(GAMEelement, HUDelement);

			renderBackground();
			try
			{
				renderHUD();
			}
			catch (error)
			{}
		}

		function	adjustSize(gameDiv, element)
		{
			element.width = gameDiv.offsetWidth;
			element.height = gameDiv.offsetHeight;
		}

		function	fillContext(element, context, color)
		{
			context.fillStyle = color;
			context.fillRect(0, 0, element.width, element.height);
		}

		function	clearContext(element, context)
		{
			context.clearRect(0, 0, element.width, element.height);
		}

		function	getFontSize(context, text, height, width, font)
		{
			let size = 230;

			context.font = size + "px " + font;
			while (height < context.measureText(text).actualBoundingBoxAscent ||
					width < context.measureText(text).width)
			{
				--size;
				context.font = size + "px " + font;
			}
			return (size);
		}

/* ************************************************************************** *\

	Background

\* ************************************************************************** */

		function renderBackground()
		{
			const Background = document.getElementById("gameBackground");
			const context = Background.getContext('2d');
			console.log("BCK2", Background);

			fillContext(Background, context, "rgba(23, 23, 23, 0.99)");
		}

/* ************************************************************************** *\

	Menu

\* ************************************************************************** */

		function	renderHUD(message)
		{
			clearContext(HUDelement, HUDcontext);
			switch (hudType)
			{
				case 0:	renderMenu();		break;
				case 1: renderLoading();	break;
				// case 2:	renderMatch();		break;
				case 3: renderPongHUD(message);	break;
				default:	break;
			}
		}

		function	menuKeyEvent(key, event)
		{
			if (hudType <= 2)
			{
				if (event === "keydown")
				{
					switch (key)
					{
						case 13://enter
							switch (menuList[menuSelect])
							{
								case "Solo Game":
									connectToServer("pongSolo");
									hudType = 1;
									break;
								case "Find Match":
									console.log(menuSelect, "Find Match");
									hudType = 1;
									break;
								case "Infinite Load":
									hudType = 1;
									break ;
								default:
									break;
							}
							break ;
						case 27://Escape
							hudType = 0;
							break ;
						case 38://ArrowUp
							if (menuSelect > 0)
								--menuSelect;
							break;
						case 40://ArrowDown
							if (menuSelect < menuList.length - 1)
								++menuSelect;
							break;
						default:
							break;
					}
				}
			}
			else
				menuSelect = 0;
		}

		function	renderMenu()
		{
			fillContext(HUDelement, HUDcontext, "rgba(23, 23, 23, 1)");

			renderMenuHead("PONG");
			renderMenuList();
		}

		function	renderMenuHead(name)
		{
			HUDcontext.fillStyle = "rgba(42, 42, 42, 1)";
			HUDcontext.fillRect(0, 0, HUDelement.width, HUDelement.height * 0.23);
			HUDcontext.fillStyle = "rgba(192, 192, 192, 1)";
			HUDcontext.fillRect(0, HUDelement.height * 0.23, HUDelement.width, HUDelement.height * 0.02);

			let size = getFontSize(HUDcontext, name, HUDelement.height * 0.16, HUDelement.width * 0.75, font);
			HUDcontext.font = size + "px " + font;
			let posX = (HUDelement.width - HUDcontext.measureText(name).width) * 0.5;
			let sizeY = HUDcontext.measureText(name).actualBoundingBoxAscent
			let posY = HUDelement.height * 0.04 + HUDcontext.measureText(name).actualBoundingBoxAscent;
			HUDcontext.fillText(name, posX, posY);
		}

		function	renderMenuList()
		{
			let size = 100;
			for (let i = 0; i < menuList.length; ++i)
			{
				let temp = getFontSize(HUDcontext, menuList[i], 
										HUDelement.height * 0.75 / (menuList.length + 2), HUDelement.width * 0.75, font);
				if (temp < size)
					size = temp;
			}
			HUDcontext.font = size + "px " + font;
			let sizeY = HUDcontext.measureText("X").actualBoundingBoxAscent;
			HUDcontext.font = (size * 0.75) + "px " + font;

			for (let i = 0; i < menuList.length; ++i)
			{
				if (i === menuSelect)
					HUDcontext.fillStyle = "rgba(255, 127, 0, 1)";
				else
					HUDcontext.fillStyle = "rgba(123, 123, 123, 1)";
				let posX = HUDelement.width * 0.5 - HUDcontext.measureText(menuList[i]).width / 2;
				let posY = HUDelement.height * 0.25 + + sizeY * (i + 2);
				HUDcontext.fillText(menuList[i], posX, posY);
			}
		}

		function	renderLoading()
		{
			let msg = "Loading";
			let dots = new Date().getSeconds() % 4;
			msg += ".".repeat(dots);
			msg += " ".repeat(4 - dots);
			
			let size = getFontSize(HUDcontext, msg, HUDelement.height / 2, HUDelement.width / 2, font);
			HUDcontext.fillStyle = "rgba(123, 123, 123, 1)";
			HUDcontext.font = size + "px " + font;
			let posX = HUDelement.width / 2 - (HUDcontext.measureText(msg).width / 2);
			let posY = HUDelement.height / 2;
			HUDcontext.fillText(msg, posX, posY);
			setTimeout(renderHUD, 500);
		}

/* ************************************************************************** *\

	Pong

\* ************************************************************************** */

		function renderPong(message)
		{
			const element = document.getElementById("gamePongCanvas");
			const context = element.getContext("2d");

			// console.log(message);
			const data = JSON.parse(message);
			// console.log("data player1", data.Player1)
			clearContext(element, context);
			addPaddle(element, context, data.Player1);
			addPaddle(element, context, data.Player2);
			addBall(element, context, data.Ball);
		}

		function	addPaddle(element, context, player)
		{
			context.fillStyle = "orange";

			player.posX = (player.posX - (player.width / 2)) * element.width;
			player.posY = (player.posY - (player.height / 2)) * element.height;

			context.fillRect(player.posX, player.posY, player.width * element.width, player.height * element.height);
		}

		function	addBall(element, context, ball)
		{

		}

/* ************************************************************************** *\

	HUD

\* ************************************************************************** */

		function renderPongHUD(message)
		{
			console.log("renderHUD triggered)");
			let msg = {};

			if (message)
			{
				console.log(message);
				msg = JSON.parse(message);
			}

			// renderHUD.P1name = msg.P1name  || renderHUD.P1name || "player1";
			// renderHUD.P1score = msg.P1score || renderHUD.P1score || 0;
			// renderHUD.P1status = msg.P1status || renderHUD.P1status || "";
			// renderHUD.P2name = msg.P2name || renderHUD.P2name || "player2";
			// renderHUD.P2score = msg.P2score || renderHUD.P2score || 0;
			// renderHUD.P2status = msg.P2status || renderHUD.P2status || "";

			// renderHUD.element = document.getElementById("gameHUD");
			// const HUD = document.getElementById("gameHUD");
			// const context = HUD.getContext("2d");
			HUDinfo(message);
			clearContext(HUDinfo.element, HUDinfo.context);
			AddPlayerInfo(0.25, HUDinfo.P1name, HUDinfo.P1score, HUDinfo.P1status);
			AddPlayerInfo(0.75, HUDinfo.P2name, HUDinfo.P2score, HUDinfo.P2status);
			// AddPlayerInfo(HUD, context, 0.25, renderHUD.P1name, renderHUD.P1score, "Arial");

			// AddPlayerInfo(HUD, context, 0.75, renderHUD.P2name, renderHUD.P2score, "Arial");
		}

		function	HUDinfo(message)
		{
			HUDinfo.element = document.getElementById("gameHUD");
			HUDinfo.context = HUDinfo.element.getContext("2d");

			let msg = {};
			if (message)
				msg = JSON.parse(message)
			HUDinfo.P1name = msg.P1name || HUDinfo.P1name || "player1";
			HUDinfo.P1score = msg.P1score || HUDinfo.P1score || 0;
			HUDinfo.P1status = msg.P1status || HUDinfo.P1status || "";
			HUDinfo.P2name = msg.P2name || HUDinfo.P2name || "player2";
			HUDinfo.P2score = msg.P2score || HUDinfo.P2score || 0;
			HUDinfo.P2status = msg.P2status || HUDinfo.P2status || "";
		}

		function	AddPlayerInfo(pos, name, score, status)
		{
			// const font = "Arial";
			HUDinfo.context.fillStyle = "rgba(123, 123, 123, 1)";

			HUDinfo.context.font = HUDinfo.element.width / 16 + "px " + font;
			let posX = HUDinfo.element.width * pos - HUDinfo.context.measureText(name).width / 2;
			let posY = HUDinfo.context.measureText(name).actualBoundingBoxAscent +
						HUDinfo.element.height / 23;
			HUDinfo.context.fillText(name, posX, posY);

			HUDinfo.context.font = HUDinfo.element.width / 8 + "px " + font;
			posX = HUDinfo.element.width * pos - HUDinfo.context.measureText(score).width / 2;
			posY += HUDinfo.context.measureText(score).actualBoundingBoxAscent +
					HUDinfo.element.height / 23;
			HUDinfo.context.fillText(score, posX, posY);

			HUDinfo.context.font = HUDinfo.element.width / 23 + "px " + font;
			posX = HUDinfo.element.width * pos - HUDinfo.context.measureText(status).width / 2;
			posY = HUDinfo.context.measureText(status).actualBoundingBoxAscent +
						HUDinfo.element.height * 21 / 23;
			HUDinfo.context.fillText(status, posX, posY);
		}

		// function	AddPlayerInfo(element, context, pos, name, score, font)
		// {
		// 	// renderHUD.element
		// 	context.fillStyle = "rgba(123, 123, 123, 1)";

		// 	context.font = element.width / 16 + "px " + font;
		// 	let posX = renderHUD.element.width * pos - context.measureText(name).width / 2;
		// 	let posY = context.measureText(name).actualBoundingBoxAscent + 
		// 				element.height / 23;
		// 	context.fillText(name, posX, posY);

		// 	context.font = element.width / 8 + "px " + font;
		// 	posX = element.width * pos - context.measureText(score).width / 2;
		// 	posY += context.measureText(name).actualBoundingBoxAscent + 
		// 			element.height / 23;
		// 	context.fillText(score, posX, posY);
		// }

/* ************************************************************************** *\

	-

\* ************************************************************************** */

		const getImage = () =>
		{
			// console.log("requesting Image!");
			socket.emit("image");
		};
		const gameInterval = setInterval(getImage, 32);

		return () =>
		{
			clearInterval(gameInterval);
			socket.disconnect();
		}
	}, []);



	return (
		<>
			{/* <GameStyle> */}
				<div id="game">
					<canvas id="gameBackground"></canvas>
					<canvas id="gamePongCanvas"></canvas>
					<canvas id="gameHUD"></canvas>
				</div>
				{/* <script src="GameConnect.js"></script> */}
				{/* <div className="canvas-container"> */}
					{/* <GameConnect></GameConnect> */}
					{/* <Canvas draw={draw} width="800" height="400" /> */}
				{/* </div> */}
			{/* </GameStyle> */}
		</>
	);
}

export default Game;

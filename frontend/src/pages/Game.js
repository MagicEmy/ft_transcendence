// import { styled } from 'styled-components';
import React, { useEffect } from 'react';
import io from 'socket.io-client';

import './game.css';

// const GameStyle = styled.div`
// 	// width: 100px;
// 	height: 700px;
// 	width: 100%;
// 	max-width: 80rem;
// 	padding: 2rem;
// 	margin: 0 auto;
// 	border-radius: 0.5rem;
// 	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
// 	background: #066d0d;
// `

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

		let	hudType = -1;
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

		socket.on("serverReady", () =>
		{
			console.log("Server ready!");
			hudType = 0;
			connectToGamePong("pongPair");
		});

		socket.on("disconnect", () =>
		{
			socket.emit("disconnectClient");
			socket.disconnect();
			console.log("Socket.IO connection closed");
		});

		socket.on("error", (message) =>
		{
			console.error("Socket.IO error: ", message);
		});

		socket.on("message", (message) =>
		{
			console.log("Socket.IO message: ", message);
			hudType = 0;
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
		};
		document.addEventListener('keydown', HandleKeyEvent);
		document.addEventListener('keyup', HandleKeyEvent);


/* ************************************************************************** *\

	Connect

\* ************************************************************************** */

		// function	connectToServer(msgType)
		// {
		// 	if (msgType !== undefined)
		// 	{
		// 		const connectMSG =
		// 		{
		// 			client:	window.location.hostname,
		// 			id:		window.location.hostname,
		// 			msgType:	msgType,
		// 		}
		// 		socket.emit("connectMSG", JSON.stringify(connectMSG));
		// 	}
		// }

		function	connectToGamePong(gameType)
		{
			const data =
			{
				gameType:	gameType,
				playerID:	window.location.hostname,
			};

			console.log(data);
			socket.emit("connectPong", JSON.stringify(data));
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
			switch (1)
			{
				case 1:	renderBackgroundRetro();	break ;
				case 2:	renderBackgroundModern();	break ;
				default:	break ;
			}		
		}
		
		function renderBackgroundRetro()
		{
			fillContext(BCKelement, BCKcontext, "rgba(23, 23, 23, 0.99)");
			const posX = BCKelement.width / 2 - 2;
			const square =
			{
				height: BCKelement.height / 60,
				width:	4,
			}
			BCKcontext.fillStyle = "rgba(123, 123, 123, 1)";
			for (let posY = square.height / 2; posY < BCKelement.height; posY += square.height * 2)
				BCKcontext.fillRect(posX, posY, square.width, square.height);
		}	

		function renderBackgroundModern()
		{
			fillContext(BCKelement, BCKcontext, "rgba(23, 123, 23, 0.99)");
			const posX = BCKelement.width / 2 - 2;
			const square =
			{
				height: BCKelement.height / 60,
				width:	4,
			}
			BCKcontext.fillStyle = "rgba(123, 123, 123, 1)";
			for (let posY = square.height / 2; posY < BCKelement.height; posY += square.height * 2)
				BCKcontext.fillRect(posX, posY, square.width, square.height);
		}

/* ************************************************************************** *\

	Menu

\* ************************************************************************** */

		function	renderHUD(message)
		{
			// console.log("rendering HUD", hudType, message);
			// clearContext(HUDelement, HUDcontext);
			switch (hudType)
			{
				case -1:	renderWord("Connecting"); break;
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
									// connectToServer("pongSolo");
									connectToGamePong("pongSolo");
									hudType = 1;
									break;
								case "Find Match":
									connectToGamePong("pongMatch");
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
				renderHUD();
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
			let posY = HUDelement.height * 0.04 + sizeY;
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

		function	renderWord(msg)
		{
			let dots = new Date().getSeconds() % 4;
			msg += ".".repeat(dots);
			msg += " ".repeat(4 - dots);
			
			let size = getFontSize(HUDcontext, msg, HUDelement.height / 2, HUDelement.width / 2, font);
			HUDcontext.font = size + "px " + font;
			let posX = HUDelement.width / 2 - (HUDcontext.measureText(msg).width / 2);
			let posY = HUDelement.height / 2;
			
			fillContext(HUDelement, HUDcontext,"rgba(23, 23, 23, 1)");
			HUDcontext.fillStyle = "rgba(123, 123, 123, 1)";
			HUDcontext.fillText(msg, posX, posY);
			setTimeout(renderHUD, 500);
		}

		function	renderLoading()
		{
			let msg = "Loading";
			let dots = new Date().getSeconds() % 4;
			msg += ".".repeat(dots);
			msg += " ".repeat(4 - dots);
			
			let size = getFontSize(HUDcontext, msg, HUDelement.height / 2, HUDelement.width / 2, font);
			HUDcontext.font = size + "px " + font;
			let posX = HUDelement.width / 2 - (HUDcontext.measureText(msg).width / 2);
			let posY = HUDelement.height / 2;
			
			fillContext(HUDelement, HUDcontext,"rgba(23, 23, 23, 1)");
			HUDcontext.fillStyle = "rgba(123, 123, 123, 1)";
			HUDcontext.fillText(msg, posX, posY);
			setTimeout(renderHUD, 500);
		}

/* ************************************************************************** *\

	Pong

\* ************************************************************************** */

		function renderPong(message)
		{
			const data = JSON.parse(message);
			clearContext(PONGelement, PONGcontext);
			switch (1)
			{
				case 1:	renderPongModern(data);	break;
				default:	break ;
			}
		}

		function	renderPongModern(data)
		{
			addPaddleModern(data.Player1); 
			addPaddleModern(data.Player2);
			addBallModern(data.Ball);
		}

		function	addPaddleModern(player)
		{
			PONGcontext.fillStyle = "orange";

			player.posX = (player.posX - (player.width / 2)) * PONGelement.width;
			player.posY = (player.posY - (player.height / 2)) * PONGelement.height;

			PONGcontext.fillRect(player.posX, player.posY, player.width * PONGelement.width, player.height * PONGelement.height);
		}


		function	addBallModern(ball)
		{
			// console.log(ball);
			if (ball === null)
				return ;
			ball.posX *= PONGelement.width;
			ball.posY *= PONGelement.height;
			ball.size *= PONGelement.width;
			
			PONGcontext.fillStyle = "white";
			PONGcontext.beginPath();
			PONGcontext.arc(ball.posX, ball.posY, ball.size, 0, 2 * Math.PI);
			PONGcontext.fill();
		}

/* ************************************************************************** *\

	HUD

\* ************************************************************************** */

		function renderPongHUD(message)
		{
			console.log(message);
			HUDinfo(message);
			clearContext(HUDelement, HUDcontext);
			AddPlayerInfo(0.25, HUDinfo.P1name, HUDinfo.P1score, HUDinfo.P1status);
			AddPlayerInfo(0.75, HUDinfo.P2name, HUDinfo.P2score, HUDinfo.P2status);
		}

		function	HUDinfo(message)
		{
			let msg = {};
			if (message && message !== undefined)
			{
				msg = JSON.parse(message);
				HUDinfo.P1name = msg.P1.name || HUDinfo.P1name || "player1";
				HUDinfo.P1score = msg.P1.score || HUDinfo.P1score || 0;
				HUDinfo.P1status = msg.P1.status || HUDinfo.P1status || "";
				HUDinfo.P2name = msg.P2.name || HUDinfo.P2name || "player2";
				HUDinfo.P2score = msg.P2.score || HUDinfo.P2score || 0;
				HUDinfo.P2status = msg.P2.status || HUDinfo.P2status || "";
			}
			else
			{
				HUDinfo.P1name = HUDinfo.P1name || "player1";
				HUDinfo.P1score = HUDinfo.P1score || 0;
				HUDinfo.P1status = HUDinfo.P1status || "";
				HUDinfo.P2name = HUDinfo.P2name || "player2";
				HUDinfo.P2score = HUDinfo.P2score || 0;
				HUDinfo.P2status = HUDinfo.P2status || "";
			}
		}

		function	AddPlayerInfo(pos, name, score, status)
		{
			HUDcontext.fillStyle = "rgba(123, 123, 123, 1)";

			HUDcontext.font = HUDelement.width / 16 + "px " + font;
			let posX = HUDelement.width * pos - HUDcontext.measureText(name).width / 2;
			let posY = HUDcontext.measureText(name).actualBoundingBoxAscent +
						HUDelement.height / 23;
			HUDcontext.fillText(name, posX, posY);

			HUDcontext.font = HUDelement.width / 8 + "px " + font;
			posX = HUDelement.width * pos - HUDcontext.measureText(score).width / 2;
			posY += HUDcontext.measureText(score).actualBoundingBoxAscent +
					HUDelement.height / 23;
			HUDcontext.fillText(score, posX, posY);

			HUDcontext.font = HUDelement.width / 23 + "px " + font;
			posX = HUDelement.width * pos - HUDcontext.measureText(status).width / 2;
			posY = HUDcontext.measureText(status).actualBoundingBoxAscent +
						HUDelement.height * 21 / 23;
			HUDcontext.fillText(status, posX, posY);
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

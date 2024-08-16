// import React, { useEffect, useContext } from 'react';
// import UserContext from '../../context/UserContext';
import GameLogic from './GameLogic';
import GameStyle from './GameStyle';
import GameSocket from './GameSocket';

enum Game
{
	Pong,
}

enum GamePongTheme
{
	Retro,
}

class GameMenu
{
	public name:	string;
	public flag:	string;
	public active:	boolean;
	public up:	GameMenu | null;
	public down:	GameMenu | null;
	public left:	GameMenu | null;
	public right:	GameMenu | null;

	public constructor(name: string, flag: string)
	{
		this.name = name;
		this.flag = flag;
		this.active = false;
		this.up = null;
		this.down = null;
		this.left = null;
		this.right = null;
	}
}

class GameGraphics
{
	private static instance: GameGraphics | null = null;
	// private static userID: any = useContext(UserContext);


	private GameElement: HTMLDivElement;
	private BackElement: HTMLCanvasElement;
	private BackContext: CanvasRenderingContext2D;
	private CnvsElement: HTMLCanvasElement;
	private CnvsContext: CanvasRenderingContext2D;
	private HUDElement: HTMLCanvasElement;
	private HUDContext: CanvasRenderingContext2D;
	private MenuElement: HTMLCanvasElement;
	private MenuContext: CanvasRenderingContext2D;

	private game: Game = Game.Pong;
	private theme: number = 0;

	private constructor()
	{
		// this.GameElement = this.getElement<HTMLDivElement>("game");
		// this.BackElement = this.getElement<HTMLCanvasElement>("gameBackground");
		// this.BackContext = this.getContext(this.BackElement);
		// this.CnvsElement = this.getElement<HTMLCanvasElement>("gameCanvas");
		// this.CnvsContext = this.getContext(this.CnvsElement);
		// this.HUDElement = this.getElement<HTMLCanvasElement>("gameHUD");
		// this.HUDContext = this.getContext(this.HUDElement);
		// this.MenuElement = this.getElement<HTMLCanvasElement>("gameMenu");
		// this.MenuContext = this.getContext(this.MenuElement);

		// this.resizeElements();
	}

	public static CreateInstance(game: HTMLDivElement, back: HTMLCanvasElement, canvas: HTMLCanvasElement, HUD: HTMLCanvasElement, menu: HTMLCanvasElement): GameGraphics | null
	{
		try
		{
			if (!this.instance)
				this.instance = new GameGraphics();
			GameGraphics.instance.GameElement = game;
			GameGraphics.instance.BackElement = back;
			GameGraphics.instance.BackContext = GameGraphics.instance.getContext(GameGraphics.instance.BackElement);
			GameGraphics.instance.CnvsElement = canvas;
			GameGraphics.instance.CnvsContext = GameGraphics.instance.getContext(GameGraphics.instance.CnvsElement);
			GameGraphics.instance.HUDElement = HUD;
			GameGraphics.instance.HUDContext = GameGraphics.instance.getContext(GameGraphics.instance.HUDElement);
			GameGraphics.instance.MenuElement = menu;
			GameGraphics.instance.MenuContext = GameGraphics.instance.getContext(GameGraphics.instance.MenuElement);

			GameGraphics.instance.resizeElements();
		}
		catch (error)
		{
			console.error(`Error creating GameGraphics singleton: ${error}`);
			GameGraphics.instance = null;
		}
		return (GameGraphics.instance);
	}

	public static getInstance(): GameGraphics | null
	{
		// if (!GameGraphics.instance) {
		// 	try {
		// 		GameGraphics.instance = new GameGraphics();
		// 	}
		// 	catch (error) {
		// 		console.error(`Error creating GameGraphics singleton: ${error}`);
		// 		GameGraphics.instance = null;
		// 	}
		// }
		return (GameGraphics.instance);
	}

	// public setGameElement(element: HTMLDivElement): void
	// {
	// 	this.GameElement = element;
	// }
	
	// public setBackElement(element: HTMLCanvasElement): void
	// {
	// 	this.BackElement = element;
	// 	this.BackContext = this.getContext(element);
	// }
	
	// public setCnvsElement(element: HTMLCanvasElement): void
	// {
	// 	this.CnvsElement = element;
	// 	this.CnvsContext = this.getContext(element);
	// }
	// public setHUDElement(element: HTMLCanvasElement): void
	// {
	// 	this.HUDElement = element;
	// 	this.HUDContext = this.getContext(element);
	// }
	// public setMenuElement(element: HTMLCanvasElement): void
	// {
	// 	this.MenuElement = element;
	// 	this.MenuContext = this.getContext(element);
	// }



	// private getElement<T extends HTMLElement>(elementId: string): T
	// {
	// 	let element: T | null;

	// 	element = document.getElementById(elementId) as T | null;
	// 	if (!(element instanceof HTMLElement))
	// 		throw (`Failed to get element ${elementId}`);
	// 	return (element);
	// }

	private getContext(element: HTMLCanvasElement): CanvasRenderingContext2D
	{
		let context: CanvasRenderingContext2D | null | undefined;

		context = element.getContext("2d");

		if (!(context instanceof CanvasRenderingContext2D))
			throw (`Failed to get 2D context for ${element.id}`);
		return (context);
	}

	public resizeElements(): void
	{
		if (this.GameElement.offsetHeight === 0)
			window.location.reload();
		
		this.GameElement.style.setProperty(`--TsHeightAdjust`, `${this.GameElement.offsetTop}px`);

		this.adjustSize(this.BackElement);
		this.adjustSize(this.CnvsElement);
		this.adjustSize(this.HUDElement);
		this.adjustSize(this.MenuElement);

		this.renderBackground();
	}

	private adjustSize(element: HTMLCanvasElement): void
	{
		var width: number = this.GameElement.offsetWidth;
		var height: number = this.GameElement.offsetHeight;
		element.width = width > height * 4 / 3 ? height * 4 / 3 : width;
		element.height = height > width * 3 / 4 ? width * 3 / 4 : height;
	}

	private clearContext(element: HTMLCanvasElement, context: CanvasRenderingContext2D): void
	{
		context.clearRect(0, 0, element.width, element.height);
	}

	private fillContext(element: HTMLCanvasElement, context: CanvasRenderingContext2D, color: string): void
	{
		context.fillStyle = color;
		context.fillRect(0, 0, element.width, element.height);
	}

	/* ************************************************************************** *\
	
		BackGround
	
	\* ************************************************************************** */

	private renderBackground(): void
	{
		this.clearContext(this.BackElement, this.BackContext);

		switch (this.game)
		{
			case Game.Pong:
				this.renderBackgroundPong(); break;
			default:
				console.error(`Error: Undefined game ${this.game}`); break;
		}
	}

	private renderBackgroundPong(): void
	{
		switch (this.theme)
		{
			case GamePongTheme.Retro:
				this.renderBackgroundPongRetro(); break;
			default:
				console.error(`Error: Undefined Pong theme ${this.theme}`); break;
		}
	}

	private renderBackgroundPongRetro(): void
	{
		this.fillContext(this.BackElement, this.BackContext, GameStyle.Retro.BACKGROUND);
		const posX: number = this.BackElement.width / 2 - 2;
		const square =
		{
			height: this.BackElement.height / 60,
			width: 4,
		};
		this.BackContext.fillStyle = GameStyle.Retro.LINES;
		for (let posY: number = square.height / 2; posY < this.BackElement.height; posY += square.height * 2)
			this.BackContext.fillRect(posX, posY, square.width, square.height);
	}

	/* ************************************************************************** *\
	
		Canvas
	
	\* ************************************************************************** */

	public RenderCanvas(msg: any): void
	{
		// console.log(`${JSON.stringify(msg)}`);
		this.clearContext(this.CnvsElement, this.CnvsContext);
		switch (msg.Game)
		{
			case "PONG":
				this.RenderCanvasPong(msg); break;
			default:
				console.error(`Error: Undefined game ${msg.Game}`); break;
		}
	}

	private RenderCanvasPong(msg: any): void
	{
		switch (msg.Theme)
		{
			case "retro":
				this.RenderCanvasPongRetro(msg); break;
			case "modern":
				this.RenderCanvasPongModern(msg);	break;
			default:
				console.error(`Error: Undefined Pong themes ${msg.Theme}`); break;
		}
	}

//retro

	private RenderCanvasPongRetro(msg: any): void
	{
		this.AddPaddleRetro(msg.Player1);
		this.AddPaddleRetro(msg.Player2);
		this.AddBallRetro(msg.Ball);
	}

	private AddPaddleRetro(player: any)
	{
		this.CnvsContext.fillStyle = GameStyle.Retro.PADDLE;

		player.posX = (player.posX - (player.width / 2)) * this.CnvsElement.width;
		player.posY = (player.posY - (player.height / 2)) * this.CnvsElement.height;

		this.CnvsContext.fillRect(player.posX, player.posY, player.width * this.CnvsElement.width, player.height * this.CnvsElement.height);
	}

	private AddBallRetro(ball: any)
	{
		if (ball === null)
			return ;

		ball.posX *= this.CnvsElement.width;
		ball.posY *= this.CnvsElement.height;
		ball.size *= this.CnvsElement.width;

		this.CnvsContext.fillStyle = "white";
		this.CnvsContext.beginPath();
		this.CnvsContext.arc(ball.posX, ball.posY, ball.size, 0, 2 * Math.PI);
		this.CnvsContext.fill();
	}

//modern

	private RenderCanvasPongModern(msg: any): void
	{
		this.RenderPongModernBackDrop();
		this.RenderPongModernEntity(msg.Player2.posX, msg.Player2.posY, 1, msg.Player2.height / 2, "red");
		if (msg.Ball !== null)
		{
			this.RenderPongModernEntity(msg.Ball.posX, msg.Ball.posY, 0, msg.Ball.size * 2, "black");
			if (msg.Ball.posX > 0.5)
				this.RenderPongModernEntity(msg.Ball.posX, msg.Ball.posY, msg.Ball.posZ, msg.Ball.size * 2, "yellow");
		}
		this.RenderPongModernNet(0.5, "grey");
		if (msg.Ball !== null && msg?.Ball.posX <= 0.5)
			this.RenderPongModernEntity(msg.Ball.posX, msg.Ball.posY, msg.Ball.posZ, msg.Ball.size * 2, "yellow");
		this.RenderPongModernEntity(msg.Player1.posX, msg.Player1.posY, 1 - msg.Player1.height, msg.Player1.height / 2, "red");
	}

	private RenderPongModernBackDrop()
	{
		let posXY: {posX: number, posY: number};

		// Background
		this.fillContext(this.CnvsElement, this.CnvsContext, "black");

		// Table outline
		this.CnvsContext.fillStyle = "white";
		this.CnvsContext.beginPath();
		posXY = this.GetXY(1, 1, 0);
		this.CnvsContext.moveTo(posXY.posX, posXY.posY);
		posXY = this.GetXY(1, 0, 0);
		this.CnvsContext.lineTo(posXY.posX, posXY.posY);
		posXY = this.GetXY(0, 0, 0);
		this.CnvsContext.lineTo(posXY.posX, posXY.posY);
		posXY = this.GetXY(0, 1, 0);
		this.CnvsContext.lineTo(posXY.posX, posXY.posY);
		posXY = this.GetXY(1, 1, 0);
		this.CnvsContext.lineTo(posXY.posX, posXY.posY);
		this.CnvsContext.fill();
		this.CnvsContext.closePath();

		// Table Color
		this.CnvsContext.fillStyle = "green";
		this.CnvsContext.beginPath();
		posXY = this.GetXY(22/23, 22/23, 0);
		this.CnvsContext.moveTo(posXY.posX, posXY.posY);
		posXY = this.GetXY(22/23, 1/23, 0);
		this.CnvsContext.lineTo(posXY.posX, posXY.posY);
		posXY = this.GetXY(1/23, 1/23, 0);
		this.CnvsContext.lineTo(posXY.posX, posXY.posY);
		posXY = this.GetXY(1/23, 22/23, 0);
		this.CnvsContext.lineTo(posXY.posX, posXY.posY);
		this.CnvsContext.fill();
		this.CnvsContext.closePath();
	}
	
	private RenderPongModernNet(height: number, color: string)
	{
		let posXY: {posX: number, posY: number};

		this.CnvsContext.fillStyle = color;
		this.CnvsContext.beginPath();
		posXY = this.GetXY(height, 0, 0.5);
		this.CnvsContext.moveTo(posXY.posX, posXY.posY);
		posXY = this.GetXY(height, 1, 0.5);
		this.CnvsContext.lineTo(posXY.posX, posXY.posY);
		posXY = this.GetXY(height, 1, 0);
		this.CnvsContext.lineTo(posXY.posX, posXY.posY);
		posXY = this.GetXY(height, 0, 0);
		this.CnvsContext.lineTo(posXY.posX, posXY.posY);
		this.CnvsContext.fill();
		this.CnvsContext.closePath();
	}

	private RenderPongModernEntity(posX: number, posY: number, posZ: number, size: number, color: string)
	{
		let posXYsize: {posX: number, posY: number, size?: number};

		posXYsize = this.GetXY(posX, posY, posZ, size);

		this.CnvsContext.fillStyle = color;
		this.CnvsContext.beginPath();
		this.CnvsContext.arc(posXYsize.posX, posXYsize.posY, posXYsize.size, 0, Math.PI * 2);
		this.CnvsContext.fill();
	}

	private GetXY(posX: number, posY: number, posZ: number, size?: number): {posX: number, posY: number, size?: number}
	{
		const angle: {hor: number, verUp: number, verDown: number} = {hor: 0.4 * Math.PI, verUp: 0.25 * Math.PI, verDown: 0.35 * Math.PI};
		const cam: {posX: number, posY: number} = {posX: -1, posY: 3};

		const fieldWidth: number = 2 * (posX - cam.posX) * Math.tan(angle.hor / 2);
		const fieldHeightUp: number = (posX - cam.posX) * Math.tan(angle.verUp);
		const fieldHeightDown: number = (posX - cam.posX) * Math.tan(angle.verDown);

		let frameX: number = ((fieldWidth - 1) / 2 + (posY)) / fieldWidth;
		let frameY: number;
		if (posZ > cam.posY)
			frameY = posZ;
		else
			frameY = fieldHeightUp + (cam.posY - posZ) / fieldHeightDown;
		frameY /= (fieldHeightUp + fieldHeightDown);

		if (!size)
			size = 0;

		return {posX: frameX * this.CnvsElement.width, 
			posY: frameY * this.CnvsElement.height,
			size: size / fieldWidth * this.CnvsElement.width};
	}

	/* ************************************************************************** *\
	
		HUD (Heads Up Display)
	
	\* ************************************************************************** */

	public renderHUD(message: string): void
	{
		console.log(`Rendering HUD ${message}`);
		const msg: any = JSON.parse(message);
		switch (msg.game)
		{
			case "pong":
				this.renderHUDPong(msg); break;
			default:
				console.error(`Error: Undefined game ${this.theme}`);
				return;
		}
		GameLogic.getInstance()?.SetGameStateTo(4);
	}

	private renderHUDPong(msg: any): void
	{
		switch (this.theme)
		{
			case GamePongTheme.Retro:
				this.renderHUDPongRetro(msg); break;
			default:
				console.error(`Error: Undefined Pong theme ${this.theme}`); break;
		}
	}

	private renderHUDPongRetro(msg: any): void
	{
		// console.warn("Need HUD to account for resizing");
		this.clearContext(this.HUDElement, this.HUDContext);
		this.AddPlayerInfo(0.25, msg.P1.name, msg.P1.score, msg.P1.status);
		this.AddPlayerInfo(0.75, msg.P2.name, msg.P2.score, msg.P2.status);
	}

	private AddPlayerInfo(pos: number, name: string, score: string, status: string)
	{
		this.HUDContext.fillStyle = "rgba(123, 123, 123, 1)";

		this.HUDContext.font = this.HUDElement.width / 16 + "px " + GameStyle.Menu.FONTDEFAULT;
		let posX = this.HUDElement.width * pos - this.HUDContext.measureText(name).width / 2;
		let posY = this.HUDContext.measureText(name).actualBoundingBoxAscent +
					this.HUDElement.height / 23;
		this.HUDContext.fillText(name, posX, posY);

		this.HUDContext.font = this.HUDElement.width / 8 + "px " + GameStyle.Menu.FONTDEFAULT;
		posX = this.HUDElement.width * pos - this.HUDContext.measureText(score).width / 2;
		posY += this.HUDContext.measureText(score).actualBoundingBoxAscent +
				this.HUDElement.height / 23;
		this.HUDContext.fillText(score, posX, posY);

		this.HUDContext.font = this.HUDElement.width / 23 + "px " + GameStyle.Menu.FONTDEFAULT;
		posX = this.HUDElement.width * pos - this.HUDContext.measureText(status).width / 2;
		posY = this.HUDContext.measureText(status).actualBoundingBoxAscent +
					this.HUDElement.height * 21 / 23;
		this.HUDContext.fillText(status, posX, posY);
	}

	/* ************************************************************************** *\
	
		HUD - Words
	
	\* ************************************************************************** */

	private RenderHead(title: string): void
	{
		const height = 0.23;
		this.HUDContext.fillStyle = GameStyle.Menu.HEADER;
		this.HUDContext.fillRect(0, 0, this.HUDElement.width, this.HUDElement.height * height);
		this.HUDContext.fillStyle = GameStyle.Menu.BORDER;
		this.HUDContext.fillRect(0, this.HUDElement.height * (height - 0.01), this.HUDElement.width, this.HUDElement.height * 0.01);

		const size = this.getFontSize(this.HUDContext, title, this.HUDElement.height * height / 2, this.HUDElement.width * 0.75, GameStyle.Menu.FONT);
		this.HUDContext.font = size + "px " + GameStyle.Menu.FONT;
		const posX = (this.HUDElement.width - this.HUDContext.measureText(title).width) * 0.5;
		let posY = this.HUDElement.height * 0.04 + this.HUDContext.measureText(title).actualBoundingBoxAscent;
		posY = this.HUDElement.height * height * 0.75;
		this.HUDContext.fillStyle = GameStyle.Menu.FONTFOCUS;
		this.HUDContext.fillText(title, posX, posY);
	}

	public RenderWord(word: string): void
	{
		let dots = new Date().getSeconds() % 4;
		word += ".".repeat(dots);
		word += " ".repeat(4 - dots);

		let size = this.getFontSize(this.HUDContext, word, this.HUDElement.height / 2, this.HUDElement.width / 2, GameStyle.Menu.FONT); //add to this
		this.HUDContext.font = size + "px " + GameStyle.Menu.FONT;
		let posX = this.HUDElement.width / 2 - (this.HUDContext.measureText(word).width / 2);
		let posY = this.HUDElement.height / 2;

		this.fillContext(this.HUDElement, this.HUDContext, GameStyle.Menu.BODY);
		this.HUDContext.fillStyle = GameStyle.Menu.FONTDEFAULT;
		this.HUDContext.fillText(word, posX, posY);
		setTimeout(() => GameLogic.getInstance()?.UpdateGraphics?.(), 500);
	}

	/* ************************************************************************** *\
	
		Menu
	
	\* ************************************************************************** */

	// public renderMenu(selectMenu: number): void
	// {
	// 	this.fillContext(this.HUDElement, this.HUDContext, GameStyle.Menu.BODY);
	// 	this.RenderHead("Pong");
	// 	this.renderMenuList(selectMenu);
	// }
	
	public renderMenu2(menuList: string[], selectMenu: number): void
	{
		this.clearContext(this.MenuElement, this.MenuContext);
		this.clearContext(this.HUDElement, this.HUDContext);
		this.fillContext(this.HUDElement, this.HUDContext, GameStyle.Menu.BODY);
		this.RenderHead("Menu");
		this.renderMenuList2(menuList, selectMenu);
	}

	private renderMenuList2(menuList: string[], selectMenu: number): void
	{
		let size = this.HUDElement.height * 0.77 / menuList.length;
		for (let i = 0; i < menuList.length; ++i)
		{
			let temp = this.getFontSize(this.HUDContext, menuList[i], 
										this.HUDElement.height * 0.77 / (menuList.length + 2),
										this.HUDElement.width * 0.75,
										GameStyle.Menu.FONT);
			if (temp < size)
				size = temp;
		}
		this.HUDContext.font = size + "px " + GameStyle.Menu.FONT;
		const sizeH = this.HUDContext.measureText("M").actualBoundingBoxAscent;
		this.HUDContext.font = size * 0.75 + "px " + GameStyle.Menu.FONT;

		for (let i: number = 0; i < menuList.length; ++i)
		{
			if (i === selectMenu)
				this.HUDContext.fillStyle = GameStyle.Menu.FONTFOCUS;
			else
				this.HUDContext.fillStyle = GameStyle.Menu.FONTDEFAULT;
			const posX = this.HUDElement.width * 0.5 - this.HUDContext.measureText(menuList[i]).width / 2;
			const posY = this.HUDElement.height * 0.23 + sizeH * (i + 2);
			this.HUDContext.fillText(menuList[i], posX, posY);
		}
	}

	// private renderMenuList(selectMenu: number): void
	// {
	// 	const menuList: string[] | undefined = GameLogic.getInstance()?.getMenuStruct();
	// 	if (menuList === undefined)
	// 	{
	// 		console.error("Couldn't find list for menu");
	// 		return ;
	// 	}

	// 	let size = this.HUDElement.height * 0.77 / menuList.length;
	// 	for (let i = 0; i < menuList.length; ++i)
	// 	{
	// 		let temp = this.getFontSize(this.HUDContext, menuList[i], 
	// 									this.HUDElement.height * 0.77 / (menuList.length + 2),
	// 									this.HUDElement.width * 0.75,
	// 									GameStyle.Menu.FONT);
	// 		if (temp < size)
	// 			size = temp;
	// 	}
	// 	this.HUDContext.font = size + "px " + GameStyle.Menu.FONT;
	// 	const sizeH = this.HUDContext.measureText("M").actualBoundingBoxAscent;
	// 	this.HUDContext.font = size * 0.75 + "px " + GameStyle.Menu.FONT;

	// 	for (let i: number = 0; i < menuList.length; ++i)
	// 	{
	// 		if (i === selectMenu)
	// 			this.HUDContext.fillStyle = GameStyle.Menu.FONTFOCUS;
	// 		else
	// 			this.HUDContext.fillStyle = GameStyle.Menu.FONTDEFAULT;
	// 		const posX = this.HUDElement.width * 0.5 - this.HUDContext.measureText(menuList[i]).width / 2;
	// 		const posY = this.HUDElement.height * 0.23 + sizeH * (i + 2);
	// 		this.HUDContext.fillText(menuList[i], posX, posY);
	// 	}
	// }
	
	/* ************************************************************************** *\
	
		Match
	
	\* ************************************************************************** */
	
	public RenderMatchMaker(message: string): void
	{
		const msg: any = JSON.parse(message);

		this.clearContext(this.HUDElement, this.HUDContext);
		this.clearContext(this.MenuElement, this.MenuContext);
		this.RenderHead("Match Maker");

		this.MenuContext.fillStyle = "orange";
		this.MenuContext.font = 42 + "px " + GameStyle.Menu.FONT;

		let posY: number = this.MenuElement.height * 0.4;
		const difY: number = this.MenuElement.height * 0.1;
		const posX: number = this.MenuElement.width * 0.25;
		for (const key in msg)
		{
			if (msg.hasOwnProperty(key))
			{
				this.MenuContext.fillText(`${key}: ${msg[key]}`, posX, posY);
				posY += difY;
			}
		}
	}

	/* ************************************************************************** *\
	
		Game Over
	
	\* ************************************************************************** */
	
	public RenderGameOver(message: string): void
	{
		this.clearContext(this.MenuElement, this.MenuContext);
		this.clearContext(this.HUDElement, this.HUDContext);
		this.fillContext(this.HUDElement, this.HUDContext, "black");

		this.RenderHead("Game Over");
		this.RenderEndGameInfo(message);
	}

	private RenderEndGameInfo(message: string): void
	{
		const msg: any = JSON.parse(message);
		let printMsg: string;
		let won: boolean;

		//define winner
		if (msg.player1Score > msg.player2Score)
			won = true;
		else if (msg.player1Score < msg.player2Score)
			won = false;

		//convert to local player
		if (msg.player2ID === GameSocket.GetID() && won !== undefined)
			won = !won;

		//print info
		if (won === true)
		{
			this.MenuContext.fillStyle = "green";
			printMsg = "You won!";
		}
		else if (won === false)
		{
			this.MenuContext.fillStyle = "red";
			printMsg = "You lost!";
		}
		this.MenuContext.font = 42 * 0.75 + "px " + GameStyle.Menu.FONT;
		this.MenuContext.fillText(printMsg, this.MenuElement.width / 4, this.MenuElement.height / 3, this.MenuElement.width / 2);
		this.MenuContext.fillStyle = "grey";
		this.MenuContext.fillText(`${msg.player1Score}:${msg.player2Score}`, this.MenuElement.width / 4, this.MenuElement.height * 0.4, this.MenuElement.width / 2);
		this.MenuContext.fillText("Press 'any' key to continue", this.MenuElement.width / 4, this.MenuElement.height * 0.9, this.MenuElement.width / 2);
	}

	/* ************************************************************************** *\
	
		Util
	
	\* ************************************************************************** */
	
	private getFontSize(context: CanvasRenderingContext2D, text: string, height: number, width: number, font: string): number
	{
		let size: number = 230;
	
		context.font = size + "px " + font;
		while (height < context.measureText(text).actualBoundingBoxAscent ||
				width < context.measureText(text).width)
		{	
			--size;
			context.font = size + "px " + font;
		}	
		return (size);
	}	
}	

export default GameGraphics

import React, { useEffect, useContext } from 'react';
import UserContext from '../../context/UserContext';
import GameLogic from './GameLogic';
import GameStyle from './GameStyle';

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
		this.GameElement = this.getElement<HTMLDivElement>("game");
		this.BackElement = this.getElement<HTMLCanvasElement>("gameBackground");
		this.BackContext = this.getContext(this.BackElement);
		this.CnvsElement = this.getElement<HTMLCanvasElement>("gameCanvas");
		this.CnvsContext = this.getContext(this.CnvsElement);
		this.HUDElement = this.getElement<HTMLCanvasElement>("gameHUD");
		this.HUDContext = this.getContext(this.HUDElement);
		this.MenuElement = this.getElement<HTMLCanvasElement>("gameMenu");
		this.MenuContext = this.getContext(this.MenuElement);

		this.resizeElements();
	}

	public static getInstance(): GameGraphics | null
	{
		if (!GameGraphics.instance) {
			try {
				GameGraphics.instance = new GameGraphics();
			}
			catch (error) {
				console.error(`Error creating GameGraphics singleton: ${error}`);
				GameGraphics.instance = null;
			}
		}
		return (GameGraphics.instance);
	}

	private getElement<T extends HTMLElement>(elementId: string): T
	{
		let element: T | null;

		element = document.getElementById(elementId) as T | null;
		if (!(element instanceof HTMLElement))
			throw (`Failed to get element ${elementId}`);
		return (element);
	}

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

	private RenderCanvasPongModern(msg: any): void
	{
		this.RenderPongModernBackDrop();
		this.RenderPongModernEntity(this.RenderPongModernCalculateEntity(msg.Player2.posX, msg.Player2.posY, msg.Player2.height / 2), "red");
		if (msg.Ball !== null && msg.Ball.posX > 0.5)
			this.RenderPongModernEntity(this.RenderPongModernCalculateEntity(msg.Ball.posX, msg.Ball.posY, msg.Ball.size * 2), "yellow");
		this.RenderPongModernNet(this.RenderPongModernCalculateEntity(0.5, 0.1, 1));
		if (msg.Ball !== null && msg?.Ball.posX <= 0.5)
			this.RenderPongModernEntity(this.RenderPongModernCalculateEntity(msg.Ball.posX, msg.Ball.posY, msg.Ball.size * 2), "yellow");
		this.RenderPongModernEntity(this.RenderPongModernCalculateEntity(msg.Player1.posX, msg.Player1.posY, msg.Player1.height / 2), "red");
		if (msg.Ball !== null)
			this.RenderPongModernEntity(this.RenderPongModernCalculateEntity(msg.Ball.posZ, 0.1, msg.Ball.size * 2), "orange");
	}

	private RenderPongModernBackDrop()
	{
		this.CnvsContext.fillStyle = "blue";
		this.CnvsContext.fillRect(0, 0, this.CnvsElement.width, this.CnvsElement.height * 0.34);
		this.CnvsContext.fillStyle = "green";
		this.CnvsContext.fillRect(0, this.CnvsElement.height * 0.33, this.CnvsElement.width, this.CnvsElement.height * 0.67);
	}

	private RenderPongModernNet(net: {posX: number, posY: number, size: number}): void
	{
		this.CnvsContext.fillStyle = "black";
		this.CnvsContext.fillRect(net.posX, net.posY, net.size, this.CnvsElement.height * 0.10);
	}

	private RenderPongModernEntity(enitity: {posX: number, posY: number, size: number}, color: string)
	{
		this.CnvsContext.fillStyle = color;
		this.CnvsContext.beginPath();
		this.CnvsContext.arc(enitity.posX, enitity.posY, enitity.size, 0, Math.PI * 2);
		this.CnvsContext.fill();
	}

	private RenderPongModernCalculateEntity(sourceX: number, sourceY: number, sourceSize: number)
	{
		let scale: number = Math.pow((1 - sourceX), 2);
		// let size: number = scale * sourceSize * this.CnvsElement.width;

		let size: number = sourceSize * this.CnvsElement.width * (1 - sourceX * 0.8);
		let posX: number = sourceY * this.CnvsElement.width;
		let posY: number = (-0.61269 * sourceX + 0.95634) * this.CnvsElement.height;

		return ({posX, posY, size});
	}

	/* ************************************************************************** *\
	
		HUD (Heads Up Display)
	
	\* ************************************************************************** */

	public renderHUD(message: string): void
	{
		console.log("Rendering HUD");
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
		console.warn("Need HUD to account for resizing");
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

	public renderMenu(selectMenu: number): void
	{
		this.fillContext(this.HUDElement, this.HUDContext, GameStyle.Menu.BODY);
		this.RenderHead("Pong");
		this.renderMenuList(selectMenu);
	}

	public renderMenu2(menuList: string[], selectMenu: number): void
	{
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

	private renderMenuList(selectMenu: number): void
	{
		const menuList: string[] | undefined = GameLogic.getInstance()?.getMenuStruct();
		if (menuList === undefined)
		{
			console.error("Couldn't find list for menu");
			return ;
		}

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

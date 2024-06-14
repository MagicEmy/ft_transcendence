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

		switch (this.game) {
			case Game.Pong:
				this.renderBackgroundPong(); break;
			default:
				console.error(`Error: Undefined game ${this.theme}`); break;
		}
	}

	private renderBackgroundPong(): void
	{
		switch (this.theme) {
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

	public renderCanvas(): void
	{
		switch (this.game) {
			case Game.Pong:
				this.renderCanvasPong(); break;
			default:
				console.error(`Error: Undefined game ${this.theme}`); break;
		}
	}

	private renderCanvasPong(): void
	{
		switch (this.theme) {
			case GamePongTheme.Retro:
				this.renderCanvasPongRetro(); break;
			default:
				console.error(`Error: Undefined Pong theme ${this.theme}`); break;
		}
	}

	private renderCanvasPongRetro(): void
	{

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

	private renderMenuList(selectMenu: number): void
	{
		const menuList: string[] | undefined = GameLogic.getInstance()?.getMenuList();
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

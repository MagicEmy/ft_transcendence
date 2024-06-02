import React, { useEffect, useContext } from 'react';
import UserContext from '../context/UserContext';

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
	private static font: string = "Arial";

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
		if (!GameGraphics.instance)
		{
			try
			{
				GameGraphics.instance = new GameGraphics();
			}
			catch (error)
			{
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
			throw(`Failed to get 2D context for ${element.id}`);
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
				this.renderBackgroundPong();	break ;
			default:
				console.error(`Error: Undefined game ${this.theme}`);	break ;
		}
	}

	private renderBackgroundPong()
	{
		switch (this.theme)
		{
			case GamePongTheme.Retro:
				this.renderBackgroundPongRetro();	break ;
			default:
				console.error(`Error: Undefined Pong theme ${this.theme}`);	break ;
		}
	}

	private renderBackgroundPongRetro(): void
	{
		this.fillContext(this.BackElement, this.BackContext, "rgba(23, 23, 23, 0.99)");
		const posX: number = this.BackElement.width / 2 - 2;
		const square = 
		{
			height: this.BackElement.height / 60,
			width: 4,
		};
		this.BackContext.fillStyle = "rgba(123, 123, 123, 1)";
		for (let posY: number = square.height / 2; posY < this.BackElement.height; posY += square.height * 2)
			this.BackContext.fillRect(posX, posY, square.width, square.height);
	}

/* ************************************************************************** *\

	Canvas

\* ************************************************************************** */

	public renderCanvas(): void
	{
		switch (this.game)
		{
			case Game.Pong:
				this.renderCanvasPong();	break ;
			default:
				console.error(`Error: Undefined game ${this.theme}`);	break ;
		}
	}

	private renderCanvasPong(): void
	{
		switch (this.theme)
		{
			case GamePongTheme.Retro:
				this.renderCanvasPongRetro();	break ;
			default:
				console.error(`Error: Undefined Pong theme ${this.theme}`);	break ;
		}
	}

	private renderCanvasPongRetro(): void
	{

	}

/* ************************************************************************** *\

	HUD (Heads Up Display)

\* ************************************************************************** */

	public renderHUD(): void
	{
		switch (this.game)
		{
			case Game.Pong:
				this.renderHUDPong();	break ;
			default:
				console.error(`Error: Undefined game ${this.theme}`);	break ;
		}
	}

	private renderHUDPong(): void
	{
		switch (this.theme)
		{
			case GamePongTheme.Retro:
				this.renderHUDPongRetro();	break ;
			default:
				console.error(`Error: Undefined Pong theme ${this.theme}`);	break ;
		}
	}

	private renderHUDPongRetro(): void
	{
		
	}

/* ************************************************************************** *\

	Menu

\* ************************************************************************** */

	public renderMenu(selectMenu: number)
	{
		console.error(`Undefined renderMenu ${selectMenu}`);
	}
}

export default GameGraphics

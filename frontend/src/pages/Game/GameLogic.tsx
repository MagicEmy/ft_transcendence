import GameGraphics from "./GameGraphics";
import GameSocket from "./GameSocket";
import GameMenu from "./GameMenu";
import { GameState, Button } from "./Game.enums";

class GameLogic
{
	private static instance: GameLogic | null = null;
	private gameState: GameState = GameState.ERROR;
	private menuList: GameMenu | null = null;
	private menuActive: GameMenu | null = null;

	private constructor()
	{
		this.gameState = GameState.CONNECT;
	}

	public static getInstance(): GameLogic | null
	{
		if (!GameLogic.instance)
			GameLogic.instance = new GameLogic();
		return (GameLogic.instance);
	}

	public keyPress(key: any, event: any): void
	{
		switch(this.gameState)
		{
			case GameState.CONNECT:
				this.keyPressConnect(key, event);	break;
			case GameState.MENU:
				this.keyPressMenu(key, event);	break ;
			case GameState.MATCH:
				this.keyPressMatch(key, event);	break ;
			case GameState.LOADING:
				this.keyPressLoading(key, event);	break ;
			case GameState.PLAYING:
				this.keyPressPlaying(key, event);	break ;
			case GameState.GAMEOVER:
				if (event === "keyup")
					this.ReturnToMenu();
				break ;
			default:
				console.error(`Error: Undefined game state ${this.gameState}`);	break ;
		}
		this.UpdateGraphics();
	}

	public UpdateGraphics(): void
	{
		var instance: GameGraphics | null = GameGraphics.getInstance();
		if (instance === null)
		{
			console.error("Could not find GameGraphics");
			return ;
		}
		switch(this.gameState)
		{
			case GameState.CONNECT:
				instance.RenderWord("Connecting");	break;
			case GameState.MENU:
				this.SendMenuToGraphics();	break ;
			case GameState.MATCH:
				break ;
			case GameState.LOADING:
				instance.RenderWord("Loading");	break ;
			case GameState.PLAYING:
				break ;
			case GameState.GAMEOVER:
				break ;
			default:
				console.error(`Error: Undefined game state ${this.gameState}`);	break ;
		}
	}

	private ConnectToGame(): void
	{
		let data: string[] = [];
		let node: GameMenu | null = this.menuActive;
		while (node && node.up)
			node = node.up;
		while (node !== null)
		{
			data.push(node.flag);
			node = node.down;
		}
		GameSocket.getInstance()?.emit("PlayGame", JSON.stringify(data));
	}

	private connectToGame(mode: string, type: string): void
	{
		const data =
		{
			mode: mode,
			type: type,
			data: "",
		}
		GameSocket.getInstance()?.emit("PlayGame", JSON.stringify(data));
		// console.error(`Need to socket ${gameType}/${matchType}`);
		this.gameState = GameState.LOADING;
	}

/* ************************************************************************** *\

	Connect

\* ************************************************************************** */

private keyPressConnect(key: any, event: any): void
{
	if (event === "keydown")
		return ;
	switch (key)
	{
		case Button.ESCAPE:
			console.error("Connect -> Escape");	break;
		default:
			break ;
	}
}

public SetGameStateTo(state: GameState)
{
	switch (state)
	{
		case GameState.MENU:
			this.gameState = GameState.MENU;	break;
		case GameState.MATCH:
			this.gameState = GameState.MATCH;	break;
		case GameState.PLAYING:
			this.gameState = GameState.PLAYING;	break;
		case GameState.GAMEOVER:
			this.gameState = GameState.GAMEOVER;	break;
		default:
			console.warn(`Trying to set GameState to protected ${state}`);
			break ;
	}
	this.UpdateGraphics();
}

/* ************************************************************************** *\

	Menu

\* ************************************************************************** */

	public setMenu(msg: any)
	{
		if (!msg.rows)
			return ;
		let pos: GameMenu | null;
		let columnTop: GameMenu | null;
		msg.rows.forEach((row: any, index: number) =>
		{
			if (index === 0)
			{
				this.menuList = new GameMenu(row.name, row.flag);
				this.menuActive = this.menuList;
				columnTop = this.menuList;
			}
			else if (columnTop)
				columnTop = this.SetMenuCreateRight(columnTop, row.name, row.flag);
			row.options.forEach((optionGroup: any) =>
			{
				pos = columnTop;
				while (pos && pos.down !== null)
					pos = pos.down;
			  
				optionGroup.forEach((option: any, index: number) => 
				{
					if (pos && index === 0)
						pos = this.SetMenuCreateDown(pos, option.name, option.flag)
					else if (pos)
						pos = this.SetMenuCreateRight(pos, option.name, option.flag);
				});
			});
			if (pos)
			{
				while (pos.left)
					pos = pos.left;
				this.SetMenuCreateDown(pos, "Start", "START");
			}
		});
	}

	private SetMenuCreateDown(node: GameMenu, name: string, flag: string): GameMenu
	{
		node.down = new GameMenu(name, flag);
		node.down.up = node;
		return (node.down);
	}

	private SetMenuCreateRight(node: GameMenu, name: string, flag: string): GameMenu
	{
		node.right = new GameMenu(name, flag);
		node.right.left = node;
		return (node.right);
	}

	public SendMenuToGraphics(): void
	{
		let menuList: string[] = [];
		let select = 0;

		let node: GameMenu | null = this.menuActive;
		while (node && node.up)
			node = node.up;
		for (let i: number = 0; node !== null; ++i , node = node.down)
		{
			let nodeString = node.name;
			if (node.left || node.right)
				nodeString = `< ${nodeString} >`;
			menuList.push(nodeString);
			if (node === this.menuActive)
				select = i;
		}
		GameGraphics.getInstance()?.renderMenu(menuList, select);
	}

	public getMenuStruct(): string[]
	{
		let menu: string[] = [];

		let node: GameMenu | null = this.menuList;
		while (node !== null)
		{
			let nodeString: string = node.name;
			if (node.left || node.right)
				nodeString = `< ${nodeString} >`;
			menu.push(nodeString);
			node = node.down;
		}
		return (menu);
	}

	private keyPressMenu(key: any, event: any): void
	{
		if (event === "keyup")
			return ;
		switch (key)
		{
			case Button.ENTER:
				this.keyPressMenuEnter();	break ;
			case Button.ESCAPE:
				this.keyPressMenuEscape();	break;
			case Button.ARROWLEFT:
			case Button.ARROWUP:
			case Button.ARROWRIGHT:
			case Button.ARROWDOWN:
				this.keyPressMoveMenu(key);	break;
			default:
				break ;
		}
		this.SendMenuToGraphics();
	}

	private keyPressMenuEnter(): void
	{
		if (this.menuActive?.flag === "START")
			this.ConnectToGame();
	}

	private keyPressMenuEscape(): void
	{
		console.error(`Undefined keyPressMenuEscape`);
	}

	private keyPressMoveMenu(move: number): void
	{
		switch (move)
		{
			case Button.ARROWUP:
				if (this.menuActive?.up)
					this.menuActive = this.menuActive.up;
				break ;
			case Button.ARROWDOWN:
				if (this.menuActive?.down)
					this.menuActive = this.menuActive.down;
				break ;
			case Button.ARROWRIGHT:
				if (this.menuActive?.right)
				{
					if (this.menuActive.up)
					{
						this.menuActive.up.down = this.menuActive.right;
						this.menuActive.right.up = this.menuActive.up;
						if (this.menuActive.down)
						{
							this.menuActive.down.up = this.menuActive.right;
							this.menuActive.right.down = this.menuActive.down;
						}
					}
					this.menuActive = this.menuActive.right;
				}
				break ;
			case Button.ARROWLEFT:
				if (this.menuActive?.left)
				{
					if (this.menuActive.up)
					{
						this.menuActive.up.down = this.menuActive.left;
						this.menuActive.left.up = this.menuActive.up;
						if (this.menuActive.down)
						{
							this.menuActive.down.up = this.menuActive.left;
							this.menuActive.left.down = this.menuActive.down;
						}
					}
					this.menuActive = this.menuActive.left;
				}
				break ;
			default: break ;
		}
	}

	private ReturnToMenu(): void
	{
		GameSocket.getInstance()?.emit("RequestMenu");
		this.gameState = GameState.MENU;
	}

/* ************************************************************************** *\

	Match

\* ************************************************************************** */

	private keyPressMatch(key: any, event: any): void
	{
		if (event === "keyup")
			return ;
		switch (key)
		{
			case Button.ESCAPE:
				this.keyPressMatchEscape();	break ;
			default:
				break ;
		}
	}

	private keyPressMatchEscape(): void
	{
		const data = {playerID:	GameSocket.GetID(),};

		GameSocket.getInstance()?.emit("LeaveMatchMaker", JSON.stringify(data));
	}

/* ************************************************************************** *\

	Loading

\* ************************************************************************** */

	private keyPressLoading(key: any, event: any): void
	{
		if (event === "keyup")
			return ;
		switch (key)
		{
			case Button.ESCAPE:
				this.keyPressLoadingEscape();	break ;
			default:
				break ;
		}
	}

	private keyPressLoadingEscape(): void
	{
		this.gameState = GameState.MENU;
	}

/* ************************************************************************** *\

	Playing

\* ************************************************************************** */

	private keyPressPlaying(key: any, event: any): void
	{
		GameSocket.getInstance()?.emit("Button", JSON.stringify({code: key, event: event}))
		if (event === "keyup")
			return ;
	}
}

export default GameLogic

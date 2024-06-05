import GameGraphics from "./GameGraphics";

enum GameState
{
	ERROR = -1,
	CONNECT,
	MENU,
	MATCH,
	LOADING,
	PLAYING,
}

const MenuList =
{
	SOLO:		"Solo Game",
	LOCAL:		"Local Game",
	MATCH:		"Find Match",
	INFINITE:	"Infinite Load",
	EXIT:		"Exit",
	EXTRA:		"ExtraTSX",
} as const;
type MenuKey = keyof typeof MenuList;
const menuKeys = Object.keys(MenuList) as MenuKey[];

enum Button
{
	ENTER = 13,
	ESCAPE = 27,
	SPACE = 32,
	ARROWUP = 38,
	ARROWDOWN = 40,
	s = 83,
	w = 87,
}

class GameLogic
{
	private static instance: GameLogic | null = null;
	private gameState: GameState = GameState.ERROR;
	private menuSelect: number;

	private constructor()
	{
		this.gameState = GameState.CONNECT;
		this.menuSelect = 0;
	}

	public getInstance(): GameLogic | null
	{
		if (!GameLogic.instance)
			GameLogic.instance = new GameLogic();
		return (GameLogic.instance);
	}

	public keyPress(key: any, event: any): void
	{
		console.log(`Key[${key}]: ${event}`);
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
			default:
				console.error(`Error: Undefined game state ${this.gameState}`);	break ;

		}
	}

	private connectToGame(gameType: string, matchType: string): void
	{
		console.error(`Need to socket ${gameType}/${matchType}`);
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

/* ************************************************************************** *\

	Menu

\* ************************************************************************** */

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
			case Button.ARROWUP:
			case Button.ARROWDOWN:
				this.keyPressMenuArrow(key - 39);	break;
			default:
				break ;
		}
		GameGraphics.getInstance()?.renderMenu(this.menuSelect);
	}

	private keyPressMenuEnter(): void
	{
		switch (MenuList[menuKeys[this.menuSelect]])
		{
			case MenuList.SOLO:
				this.connectToGame("pong", "solo");	break ;
			case MenuList.LOCAL:
				this.connectToGame("pong", "local");	break ;
			case MenuList.MATCH:
				this.connectToGame("pong", "match");	break ;
			case MenuList.INFINITE:
				this.gameState = GameState.LOADING;	break ;
			case MenuList.EXIT:
				break;
			default:
				console.error(`Error unknown menu item ${this.menuSelect}`);	break ;
		}
	}

	private keyPressMenuEscape(): void
	{
		console.error(`Undefined keyPressMenuEscape`);
	}

	private keyPressMenuArrow(move: number): void
	{
		let length: number = Object.keys(MenuList).length;
		this.menuSelect = (this.menuSelect + move + length) % length;
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
		console.error(`Undefined keyPressMatchEscape`);
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
		console.error(`Undefined keyPressLoadingEscape`);
	}

/* ************************************************************************** *\

	Playing

\* ************************************************************************** */

	private keyPressPlaying(key: any, event: any): void
	{
		if (event === "keyup")
			return ;
		switch (key)
		{
			default:
				break ;
		}
	}
}

export default GameLogic

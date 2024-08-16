import GameGraphics from "./GameGraphics";
import GameLogic from "./GameLogic";
import GameSocket from "./GameSocket";

class GameEventListener
{
	private static windowEventHandlers: { event: string, handler: (event: Event) => void }[] =
	[
		{ event: "resize", handler: GameEventListener.handleResizeEvent },
	];
	private static documentEventHandlers: { event: string, handler: (event: any) => void }[] =
	[
		{ event: "keydown", handler: GameEventListener.handleKeyEvent },
		{ event: "keyup", handler: GameEventListener.handleKeyEvent },
	];

	constructor()
	{
		console.log("Adding event listeners...");
		GameEventListener.windowEventHandlers.forEach(({event, handler}) =>
			window.addEventListener(event, handler));
		GameEventListener.documentEventHandlers.forEach(({event, handler}) =>
			document.addEventListener(event, handler));
	}
	
	public stopListening(): void
	{
		console.log("Stopping event listeners...");
		GameEventListener.windowEventHandlers.forEach(({event, handler}) =>
			window.removeEventListener(event, handler));
		GameEventListener.documentEventHandlers.forEach(({event, handler}) =>
			document.removeEventListener(event, handler));
	}

	private static handleResizeEvent(event: Event): void
	{
		GameGraphics.getInstance()?.ResetSize();
		GameLogic.getInstance()?.UpdateGraphics();
		GameSocket.getInstance()?.emit("GameImageFull");
	}

	private static handleKeyEvent(event: KeyboardEvent): void
	{
		GameLogic.getInstance()?.keyPress(event.keyCode, event.type);
	}
}

export default GameEventListener

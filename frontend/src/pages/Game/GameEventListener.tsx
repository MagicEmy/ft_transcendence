import GameGraphics from "./GameGraphics.tsx";

class GameEventListener
{
	private static windowEventHandlers: { event: string, handler: () => void }[] =
	[
		{ event: "resize", handler: GameEventListener.handleResizeEvent },
	];
	private static documentEventHandlers: { event: string, handler: () => void }[] =
	[
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

	private static handleResizeEvent(): void
	{
		GameGraphics.getInstance()?.resizeElements();
	}
}

export default GameEventListener

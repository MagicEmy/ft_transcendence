import { io, Socket } from "socket.io-client";

// import React, { useEffect, useContext } from 'react';
// import UserContext from '../context/UserContext';
import GameLogic from "./GameLogic";
import GameGraphics from "./GameGraphics";

class GameSocket
{
	private static instance: GameSocket | null = null;
	// private static UserPack: any;
	private static UserPack: { playerID: string, playerName: string };
	private static userContext: any | null = null;

	private host: string = process.env.REACT_APP_HOST;
	private port: number = 3006;
	private socket: Socket | null = null;

	private gameInterval: any;

	private constructor()
	{
		console.log("Trying to connect to GameServer...");
		this.socket = io(`http://${this.host}:${this.port}`);

		this.socket.on("connect", () =>
		{
			console.log("Socket.IO connection established");
		});

		this.socket.on("ServerReady"/* SockEventNames.SERVERREADY */, (message: any) =>
		{
			if (message)
				console.log("Server ready:", message);
			else
				console.log("Server ready!");

			if (GameSocket.UserPack.playerID &&
				GameSocket.UserPack.playerName)
				GameSocket.instance?.emit("UserPack", JSON.stringify(GameSocket.UserPack));
			else
				console.error(`Invalid UserPack ${GameSocket.UserPack}`);
		});

		this.socket.on("PlayerReady", (message: any) =>
		{
			if (message)
				console.log("Player ready:", message);
			else
				console.log("Player ready!");

			GameLogic.getInstance()?.SetGameStateTo(1);
		});

		this.socket.on("GameHUD", (message: any) =>
		{
			// console.log(`received HUD ${message}`);
			GameGraphics.getInstance()?.renderHUD(message);
		});

		this.socket.on("GameMenu", (message: any) =>
		{
			const instance: GameLogic | null = GameLogic.getInstance();
			instance?.setMenu(JSON.parse(message));
			instance?.SetGameStateTo(1);
		});

		this.socket.on("Matchmaker", (message: any) =>
		{
			GameLogic.getInstance()?.SetGameStateTo(2);
			GameGraphics.getInstance()?.RenderMatchMaker(message);
			// const instance: GameLogic | null = GameLogic.getInstance();
			// instance?.setMenu(JSON.parse(message));
			// instance?.SetGameStateTo(1);
		});

		this.socket.on("GameImage", (message: any) =>
		{
			// console.error(`GameImage ${message}`);
			GameGraphics.getInstance()?.RenderCanvas(JSON.parse(message));
		});

		this.socket.on("game_end", (message: any) =>
		{
			GameLogic.getInstance()?.SetGameStateTo(5);//GAMEOVER
			GameGraphics.getInstance()?.RenderGameOver(message);
		});

		// this.socket.onAny((event: any, ...args: any[]) =>
		// {
		// 	console.error(`Error: unhandled event "${event}"`, ...args);
		// });

		this.gameInterval = setInterval(() => { this.socket?.emit("GameImage"); }, 32);
		  
	}

	public static createInstance(userIdContext: any, userNameContext: any): GameSocket | null
	{
		if (!GameSocket.instance)
		{
			try
			{
				GameSocket.instance = new GameSocket();
				GameSocket.UserPack =
				{
					playerID: userIdContext,
					playerName: userNameContext,
				};
				if (!GameSocket.UserPack.playerID ||
					!GameSocket.UserPack.playerName)
					throw (`Bad User Context ${GameSocket.UserPack}`);
			}
			catch (error)
			{
				console.error(`Error creating GameGraphics singleton: ${error}`);
				GameSocket.instance = null;
			}
		}
		return (GameSocket.instance);
	}

	private static setUser(UserContext: any)
	{
		if (GameSocket.instance)
			GameSocket.userContext = UserContext;
		else
			throw (`No instance to set ${UserContext} to`);
		console.log(`User set ${GameSocket.userContext}`);
	}

	public static getInstance(): GameSocket | null
	{
		return (GameSocket.instance);
	}

	public emit(event: string, data?: any): void
	{
		// console.warn(`emitting to ${event}/${data}`);
		if (this.socket)
			this.socket.emit(event, data);
		else
			console.error("Tried to emit to non-existing socket.");
	}

	public static GetID(): string
	{
		return (GameSocket.UserPack.playerID);
	}

	// public emitUserPack(userID: any)
	// {
	// 	// console.log(`ID received for sending [${userID}][${userID.userIdContext}][${userID.userNameContext}]`);
	// 	const userPack =
	// 	{
	// 		playerID: userID.userIdContext,
	// 		playerName: userID.userNameContext,
	// 	};

	// 	userPack.playerID = 1;
	// 	userPack.playerName = "lorem";
	// 	if (userPack.playerID && userPack.playerName)
	// 		this.emit("UserPack", JSON.stringify(userPack));
	// 	else
	// 		console.error(userPack);
	// }

	public disconnect(): void
	{
		if (this.socket)
		{
			console.log("Disconnecting socket.IO");
			this.socket.disconnect();
			this.socket = null;
		}
		else
			console.error("Tried to disconnect non-existing socket.");
	}
}

export default GameSocket

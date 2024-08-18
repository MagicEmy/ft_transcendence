import { io, Socket } from "socket.io-client";

// import React, { useEffect, useContext } from 'react';
// import UserContext from '../context/UserContext';
import GameLogic from "./GameLogic";
import GameGraphics from "./GameGraphics";
import { SocketCommunication } from "./Game.communication";

class GameSocket
{
	private static instance: GameSocket | null = null;
	// private static UserPack: any;
	private static UserPack: SocketCommunication.UserPack.IUserPack;
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

		this.socket.on(SocketCommunication.UserPack.REQUEST, (message: any) =>
		{
			if (message)
				console.log("Server ready:", message);
			else
				console.log("Server ready!");

			if (GameSocket.UserPack.playerID &&
				GameSocket.UserPack.playerName)
				GameSocket.instance?.emit(SocketCommunication.UserPack.TOPIC, JSON.stringify(GameSocket.UserPack));
			else
				console.error(`Invalid UserPack ${GameSocket.UserPack}`);
		});

		this.socket.on(SocketCommunication.PLAYERREADY, (message: any) =>
		{
			if (message)
				console.log("Player ready:", message);
			else
				console.log("Player ready!");

			GameLogic.getInstance()?.SetGameStateTo(1);
		});

		this.socket.on(SocketCommunication.GAMEMENU, (message: any) =>
		{
			const instance: GameLogic | null = GameLogic.getInstance();
			instance?.setMenu(JSON.parse(message));
			instance?.SetGameStateTo(1);
		});

		this.socket.on(SocketCommunication.MatchMaker.TOPIC, (message: any) =>
		{
			GameLogic.getInstance()?.SetGameStateTo(2);
			GameGraphics.getInstance()?.RenderMatchMaker(message);
		});

		this.socket.on(SocketCommunication.NewGame.TOPIC, (message: any) =>
		{
			const msg: SocketCommunication.NewGame.INewGame = JSON.parse(message);

			GameGraphics.getInstance()?.ConfigureGame(msg.game, msg.theme);
		});

		this.socket.on(SocketCommunication.GameImage.TOPICHUD, (message: any) =>
		{
			GameGraphics.getInstance()?.renderHUD(message);
		});

		this.socket.on(SocketCommunication.GameImage.TOPIC, (message: any) =>
		{
			GameGraphics.getInstance()?.RenderCanvas(JSON.parse(message));
		});

		this.socket.on(SocketCommunication.PongStatus.TOPIC, (message: any) =>
		{
			GameLogic.getInstance()?.SetGameStateTo(5);//GAMEOVER
			GameGraphics.getInstance()?.RenderGameOver(message);
		});

		// this.socket.onAny((event: any, ...args: any[]) =>
		// {
		// 	console.warn(`Error: unhandled event "${event}"`, ...args);
		// });

		this.gameInterval = setInterval(() => { this.socket?.emit(SocketCommunication.GameImage.REQUEST); }, 32);
		  
	}

	public static createInstance(userIdContext: any, userNameContext: any): GameSocket | null
	{
		if (!GameSocket.instance?.socket)
		{
			try
			{
				GameSocket.instance?.disconnect();
				GameSocket.instance = new GameSocket();
				GameSocket.UserPack =
				{
					playerID: userIdContext,
					playerName: userNameContext,
				};
				if (!GameSocket.UserPack.playerID ||
					!GameSocket.UserPack.playerName)
					throw new Error(`Bad User Context ${GameSocket.UserPack}`);
			}
			catch (error)
			{
				console.error(`Error creating GameGraphics singleton: ${error}`);
				GameSocket.instance = null;
			}
		}
		console.log(this.instance.socket);
		return (GameSocket.instance);
	}

	private static setUser(UserContext: any)
	{
		if (GameSocket.instance)
			GameSocket.userContext = UserContext;
		else
			throw new Error(`No instance to set ${UserContext} to`);
		console.log(`User set ${GameSocket.userContext}`);
	}

	public static getInstance(): GameSocket | null
	{
		return (GameSocket.instance);
	}

	public emit(event: string, data?: any): void
	{
		if (this.socket)
			this.socket.emit(event, data);
		else
			console.error("Tried to emit to non-existing socket.");
	}

	public static GetID(): string
	{
		return (GameSocket.UserPack.playerID);
	}

	public disconnect(): void
	{
		console.log("Disconnecting socket.IO");
		this.socket?.disconnect();
		clearInterval(this.gameInterval);
	}
}

export default GameSocket

import { io, Socket } from "socket.io-client";

// import React, { useEffect, useContext } from 'react';
// import UserContext from '../context/UserContext';

class GameSocket
{
	private static instance: GameSocket | null = null;
	private static userContext: any | null = null;

	private host: string = "localhost";
	private port: number = 3006;
	private socket: Socket | null = null;


	private constructor()
	{
		console.log("Trying to connect to GameServer...");
		this.socket = io(`http://${this.host}:${this.port}`);

		this.socket.on("connect", () =>
		{
			console.log("Socket.IO connection established");
		});

		this.socket.on("ServerReady"/* SockEventNames.SERVERREADY */, (message) =>
		{
			if (message)
				console.log("Server ready:", message);
			else
				console.log("Server ready!");

			const userPack =
			{
				playerID: GameSocket.userContext.userIdContext,
				playerName: GameSocket.userContext.userNameContext,
			};

			if (!userPack.playerID || !userPack.playerName)
			{
				console.error("Hardcoding userPack");
				userPack.playerID = "1";
				userPack.playerName = "lorem";
			}
			if (userPack.playerID && userPack.playerName)
				GameSocket.instance?.emit("UserPack", JSON.stringify(userPack));
			else
				console.error(`Invalid UserPack ${userPack}`);
		});

		this.socket.onAny((event: any, ...args: any[]) =>
		{
			console.error(`Error: unhandled event "${event}"`, ...args);
		});
	}

	public static createInstance(UserContext): GameSocket | null
	{
		if (!GameSocket.instance)
		{
			try
			{
				GameSocket.instance = new GameSocket();
				GameSocket.setUser(UserContext);
			}
			catch (error)
			{
				console.error(`Error creating GameGraphics singleton: ${error}`);
				GameSocket.instance = null;
			}
		}
		return (GameSocket.instance);
	}

	private static setUser(UserContext)
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
		if (this.socket)
			this.socket.emit(event, data);
		else
			console.error("Tried to emit to non-existing socket.");
	}

	public emitUserPack(userID: any)
	{
		// console.log(`ID received for sending [${userID}][${userID.userIdContext}][${userID.userNameContext}]`);
		const userPack =
		{
			playerID: userID.userIdContext,
			playerName: userID.userNameContext,
		};

		userPack.playerID = 1;
		userPack.playerName = "lorem";
		if (userPack.playerID && userPack.playerName)
			this.emit("UserPack", JSON.stringify(userPack));
		else
			console.error(userPack);
	}

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

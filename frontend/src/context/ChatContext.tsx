import { io, Socket } from "socket.io-client";
import React from "react";
import { ChatContextType } from "../types/chat.dto";
const host : string = process.env.REACH_APP_HOST;
const SOCKET_URL = `http://${host}:3005`;
export const socket: Socket = io(SOCKET_URL);
// app context
export const ChatContext = React.createContext<ChatContextType | undefined>(undefined);

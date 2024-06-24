import { io, Socket } from "socket.io-client";
import React from "react";
import { ChatContextType } from "../types/chat.dto";
const SOCKET_URL = "http://localhost:3005";
export const socket: Socket = io(SOCKET_URL);
// app context
export const ChatContext = React.createContext<ChatContextType | undefined>(undefined);

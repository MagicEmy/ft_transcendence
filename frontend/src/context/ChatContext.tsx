import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { host } from '../utils/ApiRoutes';
import { ChatContextType, RoomDto, ChatUserDto, RoomShowDto, RoomUserDto,UserDto, MessageRoomDto, GameDto } from "../types/chat.dto";
import useStorage from '../hooks/useStorage';
import { io, Socket } from 'socket.io-client';

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [rooms, setRooms] = useState<RoomShowDto[]>([]);
  const [myRooms, setMyRooms] = useState<RoomShowDto[]>([]);
  const [currentRoom, setCurrentRoom] = useState<RoomDto | null>(null);
  const [members, setMembers] = useState<ChatUserDto[]>([]);
  const [roomMembers, setRoomMembers] = useState<RoomUserDto >({} as RoomUserDto);
  const [messages, setMessages] = useState<MessageRoomDto[]>([]);
  const [directMsg, setDirectMsg] = useState<UserDto | null >(null);
  const [gameInvite, setGameInvite] = useState<GameDto | {}>({} as GameDto);
  const [userIdStorage] = useStorage<string>("userId", "");
  const [userNameStorage] = useStorage<string>("userName", "");
  const user: UserDto = { userId: userIdStorage, userName: userNameStorage };
  
  const connectSocket = () => {
    if (!socket) {
      const newSocket = io(`http://${host}:3005`, {
        transports: ['websocket'],
        autoConnect: false
      });
      
      newSocket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      setSocket(newSocket);
    }
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    connectSocket();
    return () => {
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.connect();
    }
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);
    
  const value: ChatContextType = {
    socket,
    isConnected,
    connectSocket,
    disconnectSocket,
    user,
    currentRoom,
    setCurrentRoom,
    members,
    setMembers,
    roomMembers,
    setRoomMembers,
    messages,
    setMessages,
    directMsg,
    setDirectMsg,
    rooms,
    setRooms,
    myRooms,
    setMyRooms,
    gameInvite,
    setGameInvite,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === null) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

import "./App.css";
import Chat from "./ChatPage";
import React, { useState, FC } from "react"
import { ChatContext, socket } from "../../context/ChatContext";
import { ChatContextType, RoomDto, ChatUserDto, RoomShowDto, RoomUserDto,UserDto, MessageRoomDto } from "../../types/chat.dto";

const App: FC = () => {
  const [rooms, setRooms] = useState<RoomShowDto[]>([]);
  const [myRooms, setMyRooms] = useState<RoomShowDto[]>([]);
  const [currentRoom, setCurrentRoom] = useState<RoomDto | null>(null); 
  const [members, setMembers] = useState<ChatUserDto[]>([]);
  const [roomMembers, setRoomMembers] = useState<RoomUserDto | {}>({});
  const [messages, setMessages] = useState<MessageRoomDto[]>([]);
  const [directMsg, setDirectMsg] = useState<UserDto | null | {}>({});

  return (
    <ChatContext.Provider
      value={{
        socket,
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
      } as ChatContextType}
    >
      <Chat />
    </ChatContext.Provider>
  );
}

export default Chat;

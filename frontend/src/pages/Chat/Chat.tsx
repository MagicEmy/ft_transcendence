
import { useState } from "react"
import { ChatContext, socket } from "../../context/ChatContext";
import { ChatContextType, RoomDto, ChatUserDto, RoomShowDto, RoomUserDto,UserDto, MessageRoomDto, GameDto } from "../../types/chat.dto";
import ChatPage from "./ChatPage";
import useStorage from '../../hooks/useStorage';

const Chat = () => {
  const [rooms, setRooms] = useState<RoomShowDto[]>([]);
  const [myRooms, setMyRooms] = useState<RoomShowDto[]>([]);
  const [currentRoom, setCurrentRoom] = useState<RoomDto | null>(null);
  const [members, setMembers] = useState<ChatUserDto[]>([]);
  const [roomMembers, setRoomMembers] = useState<RoomUserDto | {}>({});
  const [messages, setMessages] = useState<MessageRoomDto[]>([]);
  const [directMsg, setDirectMsg] = useState<UserDto | null | {}>({});
  const [gameInvite, setGameInvite] = useState<GameDto | {}>({} as GameDto);
  const [userIdStorage] = useStorage<string>("userId", "");
  const [userNameStorage] = useStorage<string>("userName", "");
  const user: UserDto = { userId: userIdStorage, userName: userNameStorage };
  return (
    <ChatContext.Provider
      value={{
        socket,
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
      } as ChatContextType}
    >
      <ChatPage />
    </ChatContext.Provider>
  );
}

export default Chat;

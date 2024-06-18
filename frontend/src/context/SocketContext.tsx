import { useContext, createContext } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from '../utils/constants';
import UserContex, { IUserContext } from './UserContext';

export const SocketContext = createContext(  io(SOCKET_URL) );

export const SocketProvider = ({ children }: {children: any}) => {
	const { userIdContext } = useContext<IUserContext>(UserContex);

	const socket = io(SOCKET_URL, {
		query: { userIdContext },
	});

	return (
		<SocketContext.Provider value={socket}>
	 	 {children}
		</SocketContext.Provider>
  );
}



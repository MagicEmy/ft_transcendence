import { createContext, useContext } from "react";
import useStorage from "../hooks/useStorage";
import { connectSocket, disconnectSocket } from '../utils/socketManager';

export interface ISocketContext {
	socketLogin: () => void;
	socketLogout: () => void;
}
export const SocketContext = createContext<ISocketContext | undefined >(undefined);

export const SocketProvider = ({ children }: {children: any}) => {
	const [userIdStorage] = useStorage<string>('userId', '');

	const socketLogout = () => {
		disconnectSocket();
	  };
	
	const socketLogin = () => {
		connectSocket();
	  };
	

	return (
		<SocketContext.Provider value={{socketLogin, socketLogout}}>
	 	 {children}
		</SocketContext.Provider>
  );
}

export const useSocketContext = () => {
	const context = useContext(SocketContext);
	if (context === undefined) {
	  throw new Error('useSocketContext must be used within a SocketProvider');
	}
	return context;
  };


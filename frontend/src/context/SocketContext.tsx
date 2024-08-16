import { useContext, createContext, useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';
import UserContex, { IUserContext } from './UserContext';

export const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: any }) => {
  const { userIdContext } = useContext<IUserContext>(UserContex);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        query: { userIdContext },
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [userIdContext]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

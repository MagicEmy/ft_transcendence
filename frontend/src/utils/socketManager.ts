import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from './constants';

let socket: Socket | null = null;

export const mangeSocket = (userId: string) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      query: { userId },
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }
};

export const connectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

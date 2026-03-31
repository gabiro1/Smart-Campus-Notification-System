import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, token } = useAuth();

  useEffect(() => {
    // Only connect if user is logged in
    if (user && token) {
      const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: { token },
        transports: ['websocket'], // Faster, preferred for modern MERN
      });

      socketInstance.on('connect', () => {
        console.log('🔌 WebSocket connected: Handshake Secure');
      });

      socketInstance.on('connect_error', (err) => {
        console.error('❌ WebSocket Sync Error:', err.message);
      });

      setSocket(socketInstance);

      // Cleanup on logout or unmount
      return () => {
        socketInstance.disconnect();
        setSocket(null);
      };
    }
  }, [user, token]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

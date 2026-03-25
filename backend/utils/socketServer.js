import { Server } from "socket.io";

export let io;
export const userSocketMap = new Map(); // Maps userId -> socketId for targeted messaging

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("WebSocket connection established:", socket.id);
    
    // Client sends their userId upon connection
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User mapped: ${userId} -> ${socket.id}`);
    }

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected:", socket.id);
      if (userId) {
        userSocketMap.delete(userId);
      }
    });
  });
};

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap.get(receiverId?.toString());
};

import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../modules/user/model/User.js";

export let io;
export const userSocketMap = new Map(); // Maps userId -> socketId (Legacy Support)

/**
 * Socket Server Middleware: JWT Authentication
 * Checks for token in socket.handshake.auth
 */
const authMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: Token missing"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id)
      .populate("department")
      .populate("college")
      .select("-password");

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    // Attach user to the socket object for later use
    socket.user = user;
    next();
  } catch (err) {
    console.error("Socket Auth Error:", err.message);
    next(new Error("Authentication error: Invalid token"));
  }
};

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Adjust in production to frontend domain
      methods: ["GET", "POST"]
    }
  });

  // Use the JWT security layer
  io.use(authMiddleware);

  io.on("connection", async (socket) => {
    const userId = socket.user._id.toString();
    console.log(`🔌 WebSocket connected: ${socket.id} (User: ${socket.user.name})`);

    // 1. Maintain Legacy Mapping
    userSocketMap.set(userId, socket.id);

    // 2. Automated Room Management (Academic Hierarchy)
    // --------------------------------------------------
    // We join rooms based on user profiles to enable efficient multicasts:
    // io.to('room_dept_CS').emit(...)
    const rooms = [];

    // Room: Department (e.g. room_dept_IT)
    if (socket.user.department?.code) {
      rooms.push(`room_dept_${socket.user.department.code}`);
    }

    // Room: Level (e.g. room_level_Year_4)
    if (socket.user.level) {
      rooms.push(`room_level_${socket.user.level.replace(/\s+/g, '_')}`);
    }

    // Room: Campus/College (e.g. room_campus_CST)
    if (socket.user.college?.code) {
      rooms.push(`room_campus_${socket.user.college.code}`);
    }

    // Join all identified rooms
    if (rooms.length > 0) {
      socket.join(rooms);
      console.log(`🏠 User ${socket.user.name} joined rooms: ${rooms.join(", ")}`);
    }

    socket.on("disconnect", () => {
      console.log(`🔌 WebSocket disconnected: ${socket.id}`);
      userSocketMap.delete(userId);
    });
  });
};

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap.get(receiverId?.toString());
};

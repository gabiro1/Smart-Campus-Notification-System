import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { RateLimiterMemory } from "rate-limiter-flexible";
import User from "../modules/user/model/User.js";

export let io;
export const userSocketMap = new Map();

const socketConnLimiter = new RateLimiterMemory({
  points: 20,
  duration: 60,
});

const authMiddleware = async (socket, next) => {
  try {
    await socketConnLimiter.consume(socket.handshake.address);
  } catch {
    return next(new Error("Connection rate limit exceeded"));
  }

  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: Token missing"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return next(new Error("Authentication error: Token expired"));
    }

    const user = await User.findById(decoded.id)
      .populate("department")
      .populate("college")
      .select("-password");

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    socket.user = user;
    next();
  } catch (err) {
    console.error("Socket Auth Error:", err.message);
    next(new Error("Authentication error: Invalid token"));
  }
};

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",").map(s => s.trim());

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(authMiddleware);

  io.on("connection", async (socket) => {
    const userId = socket.user._id.toString();
    console.log(`WebSocket connected: ${socket.id} (User: ${socket.user.name})`);

    userSocketMap.set(userId, socket.id);

    const rooms = [];

    if (socket.user.department?.code) {
      rooms.push(`room_dept_${socket.user.department.code}`);
    }

    if (socket.user.level) {
      rooms.push(`room_level_${socket.user.level.replace(/\s+/g, '_')}`);
    }

    if (socket.user.college?.code) {
      rooms.push(`room_campus_${socket.user.college.code}`);
    }

    if (rooms.length > 0) {
      socket.join(rooms);
    }

    socket.join(`user:${userId}`);

    if (socket.user.role) {
      socket.join(`role:${socket.user.role}`);
    }

    socket.on("thread:join", ({ threadId }) => {
      if (threadId) {
        socket.join(`thread:${threadId}`);
      }
    });

    socket.on("thread:leave", ({ threadId }) => {
      if (threadId) {
        socket.leave(`thread:${threadId}`);
      }
    });

    socket.on("thread:typing", ({ threadId, isTyping }) => {
      socket.to(`thread:${threadId}`).emit("thread:typing", {
        threadId,
        userId,
        userName: socket.user.name,
        isTyping,
      });
    });

    socket.on("thread:read", ({ threadId, messageIds }) => {
      socket.to(`thread:${threadId}`).emit("message:read", {
        threadId,
        messageIds,
        readBy: { userId, readAt: new Date().toISOString() },
      });
    });

    socket.on("ticket:join", ({ ticketId }) => {
      if (ticketId) socket.join(`ticket:${ticketId}`);
    });

    socket.on("ticket:leave", ({ ticketId }) => {
      if (ticketId) socket.leave(`ticket:${ticketId}`);
    });

    socket.on("escalation:join", ({ escalationId }) => {
      if (escalationId) socket.join(`escalation:${escalationId}`);
    });

    socket.on("disconnect", () => {
      userSocketMap.delete(userId);
    });
  });
};

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap.get(receiverId?.toString());
};

export const emitToRole = (role, event, data) => {
  if (io) {
    io.to(`role:${role}`).emit(event, {
      ...data,
      _meta: { timestamp: Date.now(), role },
    });
  }
};

export const emitToUser = (userId, event, data) => {
  if (io) {
    const uid = userId?.toString();
    if (uid) {
      io.to(`user:${uid}`).emit(event, {
        ...data,
        _meta: { timestamp: Date.now() },
      });
    }
  }
};

export const emitApprovalCounts = (pendingEvents, pendingAnnouncements) => {
  emitToRole("principal", "approval:counts", { pendingEvents, pendingAnnouncements });
};

export const emitNewAlert = (alert) => {
  emitToRole("principal", "alert:new", { alert });
};

export const emitMetricUpdate = (metric, value, trend) => {
  emitToRole("principal", "metric:update", { metric, value, trend });
};

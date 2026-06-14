import { getReceiverSocketId, io } from "../../../utils/socketServer.js";
import ConversationThread from "../model/ConversationThread.js";

export const emitNewMessage = async (message, threadId) => {
  try {
    const thread = await ConversationThread.findById(threadId)
      .populate("participants", "_id");

    if (!thread) return;

    const unreadSummary = {};
    for (const participant of thread.participants) {
      const pid = participant._id.toString();
      unreadSummary[pid] = thread.unreadCount?.get(pid) || 0;
    }

    const totalUnread = Object.values(unreadSummary).reduce((a, b) => a + b, 0);

    for (const participant of thread.participants) {
      const pid = participant._id.toString();
      const socketId = getReceiverSocketId(pid);
      if (socketId) {
        io.to(socketId).emit("message:new", {
          threadId: threadId.toString(),
          message,
          unreadCount: unreadSummary[pid] || 0
        });
        io.to(socketId).emit("unread:updated", {
          total: totalUnread,
          threadId: threadId.toString(),
          count: unreadSummary[pid] || 0
        });
      }
    }

    io.to(`thread:${threadId}`).emit("message:new", {
      threadId: threadId.toString(),
      message,
      unreadSummary: { total: Object.values(unreadSummary).reduce((a, b) => a + b, 0) }
    });
  } catch (err) {
    console.error("Socket delivery error:", err.message);
  }
};

export const emitThreadUpdate = async (threadId, changes) => {
  try {
    io.to(`thread:${threadId}`).emit("thread:updated", {
      threadId: threadId.toString(),
      changes
    });
  } catch (err) {
    console.error("Thread update socket error:", err.message);
  }
};

export const emitMessageDeleted = async (threadId, messageId) => {
  try {
    io.to(`thread:${threadId}`).emit("message:deleted", {
      threadId: threadId.toString(),
      _id: messageId.toString()
    });
  } catch (err) {
    console.error("Message delete socket error:", err.message);
  }
};

export const emitMessageUpdated = async (threadId, message) => {
  try {
    io.to(`thread:${threadId}`).emit("message:updated", {
      threadId: threadId.toString(),
      message
    });
  } catch (err) {
    console.error("Message update socket error:", err.message);
  }
};

export const emitTicketUpdate = async (ticketId, update) => {
  try {
    io.to(`ticket:${ticketId}`).emit("ticket:status", {
      ticketId: ticketId.toString(),
      ...update
    });
  } catch (err) {
    console.error("Ticket socket error:", err.message);
  }
};

export const notifyUser = async (userId, event, data) => {
  try {
    const socketId = getReceiverSocketId(userId.toString());
    if (socketId) {
      io.to(socketId).emit(event, data);
    }
  } catch (err) {
    console.error("User notification socket error:", err.message);
  }
};

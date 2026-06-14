import { useEffect, useRef, useCallback } from 'react';
import { io as socketIO } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const SOCKET_URL = API_URL.replace('/api', '');

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem('token');
    socket = socketIO(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const useCommunicationSocket = (handlers = {}) => {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const sock = getSocket();

    const onMessageNew = (data) => handlersRef.current.onMessageNew?.(data);
    const onThreadUpdated = (data) => handlersRef.current.onThreadUpdated?.(data);
    const onTicketStatus = (data) => handlersRef.current.onTicketStatus?.(data);
    const onTicketAssigned = (data) => handlersRef.current.onTicketAssigned?.(data);
    const onEscalationCreated = (data) => handlersRef.current.onEscalationCreated?.(data);
    const onRequestStatus = (data) => handlersRef.current.onRequestStatus?.(data);
    const onUnreadUpdated = (data) => handlersRef.current.onUnreadUpdated?.(data);
    const onThreadTyping = (data) => handlersRef.current.onThreadTyping?.(data);
    const onMessageRead = (data) => handlersRef.current.onMessageRead?.(data);
    const onSlaWarning = (data) => handlersRef.current.onSlaWarning?.(data);
    const onModerationFlag = (data) => handlersRef.current.onModerationFlag?.(data);

    sock.on('message:new', onMessageNew);
    sock.on('thread:updated', onThreadUpdated);
    sock.on('ticket:status', onTicketStatus);
    sock.on('ticket:assigned', onTicketAssigned);
    sock.on('escalation:created', onEscalationCreated);
    sock.on('request:status', onRequestStatus);
    sock.on('unread:updated', onUnreadUpdated);
    sock.on('thread:typing', onThreadTyping);
    sock.on('message:read', onMessageRead);
    sock.on('ticket:sla-warning', onSlaWarning);
    sock.on('moderation:flag', onModerationFlag);

    return () => {
      sock.off('message:new', onMessageNew);
      sock.off('thread:updated', onThreadUpdated);
      sock.off('ticket:status', onTicketStatus);
      sock.off('ticket:assigned', onTicketAssigned);
      sock.off('escalation:created', onEscalationCreated);
      sock.off('request:status', onRequestStatus);
      sock.off('unread:updated', onUnreadUpdated);
      sock.off('thread:typing', onThreadTyping);
      sock.off('message:read', onMessageRead);
      sock.off('ticket:sla-warning', onSlaWarning);
      sock.off('moderation:flag', onModerationFlag);
    };
  }, []);
};

export const joinThread = (threadId) => {
  getSocket().emit('thread:join', { threadId });
};

export const leaveThread = (threadId) => {
  getSocket().emit('thread:leave', { threadId });
};

export const emitTyping = (threadId, isTyping) => {
  getSocket().emit('thread:typing', { threadId, isTyping });
};

export const emitRead = (threadId, messageIds) => {
  getSocket().emit('thread:read', { threadId, messageIds });
};

export const joinTicket = (ticketId) => {
  getSocket().emit('ticket:join', { ticketId });
};

export const leaveTicket = (ticketId) => {
  getSocket().emit('ticket:leave', { ticketId });
};

export const joinEscalation = (escalationId) => {
  getSocket().emit('escalation:join', { escalationId });
};

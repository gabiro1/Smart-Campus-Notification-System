import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useOnlineStatus } from './useOnlineStatus'
import { processSyncQueue } from '../lib/syncQueue'
import { eventDB, notificationDB, messageDB } from '../lib/db'

export default function useSocket(token, userRole) {
  const socketRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const isOnline = useOnlineStatus()

  useEffect(() => {
    if (!token || !isOnline) {
      if (socketRef.current) socketRef.current.disconnect()
      return
    }

    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000
    })

    socket.on('connect', async () => {
      setIsConnected(true)
      await processSyncQueue()
      const [serverEvents, serverNotifs, serverMsgs] = await Promise.all([
        fetch('/api/events/latest', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/notifications/latest', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/messages/latest', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
      ])
      await eventDB.syncWithServer(serverEvents, userRole)
      await notificationDB.syncWithServer(serverNotifs)
      await messageDB.syncWithServer(serverMsgs)
    })

    socket.on('event-updated', (serverEvent) => eventDB.syncWithServer([serverEvent], userRole))
    socket.on('notification-received', (serverNotif) => notificationDB.syncWithServer([serverNotif]))

    socketRef.current = socket
    return () => socket.disconnect()
  }, [token, isOnline])

  return { socket: socketRef.current, isConnected }
}

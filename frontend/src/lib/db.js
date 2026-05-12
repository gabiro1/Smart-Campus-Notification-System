import Dexie from 'dexie'

class SmartCampusDB extends Dexie {
  constructor() {
    super('SmartCampusDB')
    this.version(4).stores({
      events: '++id, serverId, operationId, title, date, updatedAt, role, version, lastModified, modifiedBy',
      notifications: '++id, serverId, operationId, title, read, createdAt, targetRole, version, lastModified, modifiedBy',
      messages: '++id, serverId, operationId, senderId, content, timestamp, read, receiverRole, version, lastModified, modifiedBy',
      syncQueue: '++id, operationId, endpoint, method, payload, retryCount, status, timestamp, entityId, actionType, userId'
    })
  }
}

const db = new SmartCampusDB()

export const ROLE_PRIORITY = ['admin', 'principal', 'dean', 'hod', 'lecturer', 'class_rep', 'student']

export const resolveConflict = (serverEntity, clientEntity) => {
  const getRole = (entity) => {
    if (entity.modifiedBy && entity.modifiedBy.role) return entity.modifiedBy.role
    return 'student'
  }
  const serverRole = getRole(serverEntity)
  const clientRole = getRole(clientEntity)
  const serverPriority = ROLE_PRIORITY.indexOf(serverRole)
  const clientPriority = ROLE_PRIORITY.indexOf(clientRole)

  if (serverPriority < clientPriority) return serverEntity
  if (serverPriority > clientPriority) return clientEntity

  const serverTime = new Date(serverEntity.lastModified || serverEntity.updatedAt || 0).getTime()
  const clientTime = new Date(clientEntity.lastModified || clientEntity.updatedAt || 0).getTime()
  return serverTime >= clientTime ? serverEntity : clientEntity
}

export const eventDB = {
  getAll: (role) => {
    if (role) return db.events.where('role').equals(role).toArray()
    return db.events.toArray()
  },
  add: (event) => {
    const item = Object.assign({}, event, {
      updatedAt: new Date().toISOString(),
      version: (event.version || 0) + 1
    })
    return db.events.add(item)
  },
  update: (id, updates) => {
    const item = Object.assign({}, updates, {
      lastModified: new Date().toISOString(),
      version: (updates.version || 0) + 1
    })
    return db.events.update(id, item)
  },
  delete: (id) => db.events.delete(id),
  syncWithServer: async (serverEvents, role) => {
    const local = role ? await db.events.where('role').equals(role).toArray() : await db.events.toArray()
    for (const sEvent of serverEvents) {
      const match = local.find((l) => l.serverId === sEvent._id || l.operationId === sEvent.operationId)
      if (match) {
        const resolved = resolveConflict(sEvent, match)
        await db.events.update(match.id, Object.assign({}, resolved, {
          serverId: sEvent._id,
          operationId: sEvent.operationId
        }))
      } else {
        await db.events.add(Object.assign({}, sEvent, {
          serverId: sEvent._id,
          operationId: sEvent.operationId
        }))
      }
    }
  }
}

export const notificationDB = {
  getAll: (role) => {
    if (role) return db.notifications.where('targetRole').equals(role).toArray()
    return db.notifications.toArray()
  },
  add: (notif) => {
    const item = Object.assign({}, notif, {
      createdAt: new Date().toISOString(),
      version: 1
    })
    return db.notifications.add(item)
  },
  markAsRead: (id) => {
    return db.notifications.update(id, {
      read: true,
      lastModified: new Date().toISOString()
    })
  },
  delete: (id) => db.notifications.delete(id),
  syncWithServer: async (serverNotifs) => {
    const local = await db.notifications.toArray()
    for (const sNotif of serverNotifs) {
      const exists = local.find((l) => l.serverId === sNotif._id || l.operationId === sNotif.operationId)
      if (!exists) {
        await db.notifications.add(Object.assign({}, sNotif, {
          serverId: sNotif._id,
          operationId: sNotif.operationId
        }))
      }
    }
  }
}

export const messageDB = {
  getAll: (role) => {
    if (role) return db.messages.where('receiverRole').equals(role).toArray()
    return db.messages.toArray()
  },
  add: (msg) => {
    const item = Object.assign({}, msg, {
      timestamp: new Date().toISOString(),
      version: 1
    })
    return db.messages.add(item)
  },
  update: (id, updates) => {
    return db.messages.update(id, Object.assign({}, updates, {
      lastModified: new Date().toISOString()
    }))
  },
  delete: (id) => db.messages.delete(id),
  syncWithServer: async (serverMsgs) => {
    const local = await db.messages.toArray()
    for (const sMsg of serverMsgs) {
      const exists = local.find((l) => l.serverId === sMsg._id || l.operationId === sMsg.operationId)
      if (!exists) {
        await db.messages.add(Object.assign({}, sMsg, {
          serverId: sMsg._id,
          operationId: sMsg.operationId
        }))
      }
    }
  }
}

export const syncQueueDB = {
  add: (operation) => {
    const item = Object.assign({}, operation, {
      timestamp: new Date().toISOString(),
      retryCount: 0,
      status: 'pending'
    })
    return db.syncQueue.add(item)
  },
  getAll: () => db.syncQueue.where('status').equals('pending').sortBy('timestamp'),
  updateStatus: (id, status, retryCount) => {
    return db.syncQueue.update(id, { status, retryCount })
  },
  remove: (id) => db.syncQueue.delete(id),
  getFailed: () => db.syncQueue.where('status').equals('failed').toArray()
}

export default db

import { v4 as uuidv4 } from 'uuid'
import { syncQueueDB } from './db'
import { eventDB, notificationDB, messageDB } from './db'

export const saveAndQueue = async (entityType, actionType, data, endpoint, userId, userRole) => {
  const operationId = uuidv4()
  const timestamp = new Date().toISOString()
  let localId

  const entity = {
    ...data,
    operationId,
    modifiedBy: { id: userId, role: userRole },
    lastModified: timestamp,
    version: 1
  }

  switch (entityType) {
    case 'event': localId = await eventDB.add(entity); break
    case 'notification': localId = await notificationDB.add(entity); break
    case 'message': localId = await messageDB.add(entity); break
    default: throw new Error('Invalid entity type')
  }

  await syncQueueDB.add({
    operationId,
    endpoint,
    method: actionType === 'DELETE' ? 'DELETE' : actionType === 'UPDATE' ? 'PUT' : 'POST',
    payload: JSON.stringify(data),
    entityId: localId,
    actionType,
    userId,
    status: 'pending',
    retryCount: 0
  })

  if (navigator.onLine) {
    const { processSyncQueue } = await import('./syncQueue')
    processSyncQueue()
  }

  return { localId, operationId }
}

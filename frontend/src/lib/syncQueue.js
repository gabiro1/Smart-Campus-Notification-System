import { syncQueueDB } from './db'

const MAX_RETRIES = 3
const BACKOFF_BASE = 1000

export const processSyncQueue = async () => {
  if (!navigator.onLine) return { processed: 0, failed: 0 }

  let token = localStorage.getItem('token')
  if (!token) return { processed: 0, failed: 0 }

  const queue = await syncQueueDB.getAll()
  let processed = 0, failed = 0

  for (const item of queue) {
    if (item.retryCount >= MAX_RETRIES) {
      await syncQueueDB.updateStatus(item.id, 'failed', item.retryCount)
      failed++
      continue
    }

    const delay = Math.min(BACKOFF_BASE * Math.pow(2, item.retryCount), 30000)
    await new Promise(resolve => setTimeout(resolve, delay))

    try {
      const response = await fetch(item.endpoint, {
        method: item.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Operation-Id': item.operationId
        },
        body: item.method !== 'GET' ? item.payload : undefined
      })

      if (response.ok) {
        await syncQueueDB.remove(item.id)
        processed++
      } else if (response.status === 409) {
        await syncQueueDB.updateStatus(item.id, 'conflict', item.retryCount)
        failed++
      } else {
        await syncQueueDB.updateStatus(item.id, 'pending', item.retryCount + 1)
        failed++
      }
    } catch {
      await syncQueueDB.updateStatus(item.id, 'pending', item.retryCount + 1)
      failed++
    }
  }

  return { processed, failed }
}

export const initSWListener = (syncCallback) => {
  if (!('serviceWorker' in navigator)) return
  
  navigator.serviceWorker.addEventListener('message', async (event) => {
    const { type, responseData, entry } = event.data
    
    switch (type) {
      case 'SILENT_PUSH':
        syncCallback?.()
        break
      case 'SYNC_SUCCESS':
        if (responseData?._id) {
          const { eventDB, messageDB, notificationDB } = await import('./db')
          const url = new URL(entry.request.url)
          let db
          if (url.pathname.includes('events')) db = eventDB
          else if (url.pathname.includes('messages')) db = messageDB
          else db = notificationDB
          
          const localEntries = await db.getAll()
          const body = JSON.parse(entry.request.body)
          const match = localEntries.find(e => !e.serverId && e.title === body.title)
          if (match) await db.update(match.id, { serverId: responseData._id })
        }
        break
      case 'SYNC_FAILED':
        console.error('Sync failed:', entry)
        break
    }
  })
}

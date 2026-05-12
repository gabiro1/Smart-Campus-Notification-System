import { useState, useEffect } from 'react'

export default function UpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false)

  useEffect(() => {
    const handleUpdate = () => setShowUpdate(true)
    window.addEventListener('sw-update-found', handleUpdate)
    return () => window.removeEventListener('sw-update-found', handleUpdate)
  }, [])

  const refresh = () => window.location.reload()

  return showUpdate ? (
    <div className="fixed bottom-24 left-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-lg flex justify-between items-center">
      <span>New version available</span>
      <button onClick={refresh} className="bg-white text-blue-600 px-4 py-2 rounded-md">Refresh</button>
    </div>
  ) : null
}

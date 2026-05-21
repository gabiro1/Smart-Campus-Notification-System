import { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null)
  const [show, setShow] = useState(false)
  const isInstalled = window.matchMedia('(display-mode: standalone)').matches

  useEffect(() => {
    if (isInstalled) return
    const handle = (e) => { e.preventDefault(); setPrompt(e); setShow(true) }
    window.addEventListener('beforeinstallprompt', handle)
    return () => window.removeEventListener('beforeinstallprompt', handle)
  }, [isInstalled])

  const install = async () => {
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setShow(false)
  }

  return show ? (
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-lg flex justify-between">
      <span>Install UniNotify AI</span>
      <button onClick={install} className="bg-white text-blue-600 px-4 py-2 rounded-md">Install</button>
    </div>
  ) : null
}

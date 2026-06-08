import { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null)
  const [show, setShow] = useState(false)
  const isInstalled = window.matchMedia('(display-mode: standalone)').matches

  useEffect(() => {
    if (isInstalled) return
    // Check if event was already captured by the early script in index.html
    if (window.deferredPrompt) {
      setPrompt(window.deferredPrompt)
      setShow(true)
      return
    }
    // Fallback: listen for the custom event dispatched by the index.html script
    const handle = () => {
      if (window.deferredPrompt) {
        setPrompt(window.deferredPrompt)
        setShow(true)
      }
    }
    window.addEventListener('pwa-install-ready', handle)
    return () => window.removeEventListener('pwa-install-ready', handle)
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

import { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null)
  const [promptFired, setPromptFired] = useState(!!window.deferredPrompt)
  const [showFallback, setShowFallback] = useState(false)
  const isInstalled = window.matchMedia('(display-mode: standalone)').matches

  useEffect(() => {
    if (isInstalled) return
    if (window.deferredPrompt) {
      setPrompt(window.deferredPrompt)
      setPromptFired(true)
      return
    }
    const handle = () => {
      if (window.deferredPrompt) {
        setPrompt(window.deferredPrompt)
        setPromptFired(true)
      }
    }
    window.addEventListener('pwa-install-ready', handle)
    // Show fallback install button after 30s if beforeinstallprompt never fired
    const timeout = setTimeout(() => {
      if (!window.deferredPrompt) setShowFallback(true)
    }, 30000)
    return () => {
      window.removeEventListener('pwa-install-ready', handle)
      clearTimeout(timeout)
    }
  }, [isInstalled])

  const install = async () => {
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setShowFallback(false)
  }

  // Show native install button when beforeinstallprompt fired
  if (promptFired && prompt) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-lg flex justify-between items-center shadow-lg">
        <span className="font-medium">Install UniNotify AI</span>
        <button onClick={install} className="bg-white text-blue-600 px-4 py-2 rounded-md font-semibold text-sm">Install</button>
      </div>
    )
  }

  // Fallback button for users whose browsers don't fire beforeinstallprompt (iOS, first visit, etc.)
  if (showFallback) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 bg-gray-900 text-white p-4 rounded-lg shadow-lg">
        <p className="text-sm mb-2">Install UniNotify AI on your device for the best experience.</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (window.deferredPrompt) {
                window.deferredPrompt.prompt()
                window.deferredPrompt.userChoice.then((c) => { if (c.outcome === 'accepted') setShowFallback(false) })
              } else {
                setShowFallback(false)
              }
            }}
            className="bg-blue-600 px-4 py-2 rounded-md font-semibold text-sm"
          >
            Install
          </button>
          <button onClick={() => setShowFallback(false)} className="px-3 py-2 text-gray-400 text-sm">Not now</button>
        </div>
      </div>
    )
  }

  return null
}

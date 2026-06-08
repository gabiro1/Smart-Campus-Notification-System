import { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null)
  const [promptFired, setPromptFired] = useState(!!window.deferredPrompt)
  const [showFallback, setShowFallback] = useState(false)
  const [dismissed, setDismissed] = useState(false)
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

  if ((!promptFired && !showFallback) || dismissed) return null

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-[9999] animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="backdrop-blur-xl bg-zinc-800/80 border border-white/15 rounded-2xl p-4 shadow-2xl sm:w-72 w-full max-w-sm mx-auto sm:mx-0">
        <button
          onClick={() => { setDismissed(true); setShowFallback(false) }}
          className="absolute top-2 right-2 text-white/50 hover:text-white/90 text-lg leading-none"
          aria-label="Dismiss"
        >
          ✕
        </button>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-6m0 0V6m0 6H6m6 0h6" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">Install UniNotify AI</p>
            <p className="text-white/60 text-xs mt-0.5">Add to home screen for quick access</p>

            <div className="flex gap-2 mt-3">
              {prompt ? (
                <button
                  onClick={install}
                  className="bg-white text-gray-900 px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-white/90 transition-colors"
                >
                  Install
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (window.deferredPrompt) {
                      window.deferredPrompt.prompt()
                      window.deferredPrompt.userChoice.then((c) => { if (c.outcome === 'accepted') setShowFallback(false) })
                    } else {
                      setDismissed(true)
                    }
                  }}
                  className="bg-white text-gray-900 px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-white/90 transition-colors"
                >
                  Install
                </button>
              )}
              <button
                onClick={() => { setDismissed(true); setShowFallback(false) }}
                className="text-white/50 hover:text-white/90 text-xs transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'

export default function InstallPrompt() {
  const promptRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches

  useEffect(() => {
    if (isStandalone) return

    if (window.deferredPrompt) {
      promptRef.current = window.deferredPrompt
      setVisible(true)
      return
    }

    const onReady = () => {
      if (window.deferredPrompt) {
        promptRef.current = window.deferredPrompt
        setVisible(true)
      }
    }

    window.addEventListener('pwa-install-ready', onReady)

    const timeout = setTimeout(() => {
      if (!window.deferredPrompt) setVisible(true)
    }, 30000)

    return () => {
      window.removeEventListener('pwa-install-ready', onReady)
      clearTimeout(timeout)
    }
  }, [isStandalone])

  const install = async () => {
    const deferred = promptRef.current || window.deferredPrompt
    if (!deferred) return
    try {
      deferred.prompt()
      const { outcome } = await deferred.userChoice
      if (outcome === 'accepted') setDismissed(true)
    } catch {
      setDismissed(true)
    }
  }

  if (!visible || dismissed) return null

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-[9999] animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="backdrop-blur-xl bg-zinc-800/80 border border-white/15 rounded-2xl p-4 shadow-2xl sm:w-72 w-full max-w-sm mx-auto sm:mx-0">
        <button
          onClick={() => setDismissed(true)}
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
              <button
                onClick={install}
                className="bg-white text-gray-900 px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-white/90 transition-colors"
              >
                Install
              </button>
              <button
                onClick={() => setDismissed(true)}
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

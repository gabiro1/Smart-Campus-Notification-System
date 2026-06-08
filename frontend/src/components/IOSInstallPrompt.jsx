import { useState, useEffect } from 'react'

export default function IOSInstallPrompt() {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const isIOS = typeof navigator.standalone !== 'undefined' || /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isInstalled = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true

  useEffect(() => {
    if (isIOS && !isInstalled) setShow(true)
  }, [])

  if (!show || dismissed) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="backdrop-blur-2xl bg-gray-900/80 border border-white/20 rounded-2xl p-4 shadow-2xl w-72">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 text-white/50 hover:text-white/90 text-lg leading-none"
          aria-label="Dismiss"
        >
          ✕
        </button>

        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">Install on iOS</p>
            <p className="text-white/60 text-xs mt-0.5 leading-relaxed">
              Tap <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white/10 rounded text-[10px]"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></span> Safari Share
            </p>
            <p className="text-white/60 text-xs leading-relaxed">
              Then <span className="text-white/80 font-medium">Add to Home Screen</span>
            </p>

            <button
              onClick={() => setDismissed(true)}
              className="mt-3 text-white/50 hover:text-white/90 text-xs transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'

export default function IOSInstallPrompt() {
  const [show, setShow] = useState(false)
  // Detect iOS: check navigator.standalone (iOS-only) OR user agent
  const isIOS = typeof navigator.standalone !== 'undefined' || /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isInstalled = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true
  
  useEffect(() => { 
    if (isIOS && !isInstalled) setShow(true) 
  }, [])
  
  if (!show) return null
  
  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-lg shadow-lg">
      <p className="text-sm">Tap Safari <span className="font-bold">Share</span> → <span className="font-bold">Add to Home Screen</span></p>
      <button onClick={() => setShow(false)} className="absolute top-2 right-2 text-white">✕</button>
    </div>
  )
}

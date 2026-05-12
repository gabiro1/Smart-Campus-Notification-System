import { useEffect } from 'react'

export default function SkipLink() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab' && !e.shiftKey) {
        const skipLink = document.getElementById('skip-link')
        if (skipLink) skipLink.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <a
      id="skip-link"
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
    >
      Skip to main content
    </a>
  )
}

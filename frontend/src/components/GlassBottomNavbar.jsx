import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { useAuth } from '../context/AuthContext'

const allNavItems = [
  { path: '/', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z', roles: ['student', 'class_rep', 'lecturer', 'hod', 'dean', 'principal', 'admin'] },
  { path: '/events', label: 'Events', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', roles: ['student', 'class_rep', 'lecturer', 'hod', 'dean', 'principal', 'admin'] },
  { path: '/live', label: 'Live', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', roles: ['lecturer', 'hod', 'dean', 'principal', 'admin'] },
  { path: '/videos', label: 'Videos', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', roles: ['student', 'class_rep', 'lecturer', 'hod', 'dean', 'principal', 'admin'] },
  { path: '/dashboard', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', roles: ['class_rep', 'lecturer', 'hod', 'dean', 'principal', 'admin'] },
  { path: '/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', roles: ['student', 'class_rep', 'lecturer', 'hod', 'dean', 'principal', 'admin'] }
]

export default function GlassBottomNavbar() {
  const [lastScroll, setLastScroll] = useState(0)
  const [visible, setVisible] = useState(true)
  const isOnline = useOnlineStatus()
  const { user } = useAuth()
  const navItems = user ? allNavItems.filter((item) => item.roles.includes(user.role)) : []

  useEffect(() => {
    const handleScroll = () => {
      const scroll = window.pageYOffset
      setVisible(scroll <= lastScroll || scroll <= 100)
      setLastScroll(scroll)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScroll])

  return (
    <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="backdrop-blur-xl bg-white/10 border-t border-white/20 rounded-t-3xl mx-3 mb-3 px-4 py-2">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `flex flex-col items-center p-2 rounded-xl active:opacity-70 transition-all ${isActive ? 'text-blue-400 scale-105' : 'text-gray-300 hover:text-white'}`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span className="text-xs mt-1">{item.label}</span>
            </NavLink>
          ))}
        </div>
        {!isOnline && <div className="text-center text-xs text-red-400 py-1">Offline Mode</div>}
      </div>
    </nav>
  )
}

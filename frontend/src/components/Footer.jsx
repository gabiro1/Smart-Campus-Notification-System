import QRCode from 'qrcode.react'
import { useState } from 'react'

export default function Footer() {
  const [copied, setCopied] = useState(false)
  const appUrl = "https://smart-campus-notification-system.vercel.app";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(appUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <footer className="bg-gray-900 text-white py-8 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* QR Code Install Section */}
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Install SmartCampus</h3>
          <p className="text-sm text-gray-400 mb-4">
            Scan the QR code to open the app and install it on your device.
          </p>
          <div className="flex justify-center">
            <div className="p-2 bg-white rounded-lg inline-block">
              <QRCode
                value="https://smart-campus-notification-system.vercel.app"
                size={128}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
                aria-label="Scan to install SmartCampus PWA"
              />
            </div>
          </div>
          <div className="mt-2 flex justify-center gap-2">
            <span className="text-xs text-gray-500 break-all">{appUrl}</span>
            <button
              onClick={handleCopy}
              className="text-xs bg-blue-600 px-2 py-1 rounded-md hover:bg-blue-700"
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            *Installs directly from browser (no app store needed)
          </p>
        </div>

        {/* Quick Links */}
        <div className="text-center md:text-left">
          <h4 className="font-semibold mb-2">Quick Links</h4>
          <ul className="space-y-1 text-sm text-gray-400">
            <li><a href="/events" className="hover:text-white">Events</a></li>
            <li><a href="/notifications" className="hover:text-white">Notifications</a></li>
            <li><a href="/settings" className="hover:text-white">Settings</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="text-center md:text-left">
          <h4 className="font-semibold mb-2">Contact</h4>
          <p className="text-sm text-gray-400">support@smartcampus.edu</p>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Smart Campus Notification System. All rights reserved.
      </div>
    </footer>
  )
}

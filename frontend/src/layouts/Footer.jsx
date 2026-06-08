import { Github, Twitter, Linkedin, Mail, MapPin, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import Logo from "../components/ui/Logo";

export default function Footer() {
  const [appUrl, setAppUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // 🔥 Safe runtime URL detection (fixes SSR/build issues)
  useEffect(() => {
    const url =
      import.meta.env.VITE_APP_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");

    setAppUrl(url);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Clipboard API failed:", error);
    }
  };

  return (
    <footer className="bg-card border-t border-border">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="lg:col-span-1 space-y-6">
            <Link to="/">
              <img
                src="/logo/Uninotify.png"
                alt="UniNotify AI"
                className="h-9 w-auto object-contain dark:brightness-0 dark:invert"
              />
            </Link>

            <p className="text-muted-foreground text-sm leading-relaxed">
              AI-powered campus notifications for the University of Rwanda. Stay informed, stay connected.
            </p>

            <div className="flex gap-3">
              <a href="/" className="w-9 h-9 rounded-lg bg-accent border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all">
                <Github size={16} />
              </a>
              <a href="/" className="w-9 h-9 rounded-lg bg-accent border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all">
                <Twitter size={16} />
              </a>
              <a href="/" className="w-9 h-9 rounded-lg bg-accent border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all">
                <Linkedin size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-bold text-foreground text-sm">Platform</h4>
            <ul className="space-y-3">
              <li><Link to="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
              <li><Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</Link></li>
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
              <li><Link to="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Get Started</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-bold text-foreground text-sm">Support</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Help Center</Link></li>
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* App Download with QR Code */}
          <div className="space-y-4">
            <h4 className="font-bold text-foreground text-sm">Download App</h4>

            <div className="bg-accent rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-4">

                {/* QR Code */}
                <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm p-2">
                  {appUrl ? (
                    <QRCodeSVG
                      value=""
                      size={80}
                      level="M"
                      includeMargin={false}
                      fgColor="#0f172a"
                      bgColor="#ffffff"
                    />
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      Loading...
                    </div>
                  )}
                </div>

                {/* Text */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Smartphone className="text-blue-500" size={18} />
                    <span className="text-sm font-semibold text-foreground">
                      Mobile App
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Scan QR code to open the app instantly
                  </p>

                  <p className="text-xs text-blue-500 font-medium">
                    PWA Ready
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <span>© 2026 UniNotify AI</span>
              <span className="hidden md:block">•</span>

              <span className="hidden md:flex items-center gap-1.5">
                <Mail size={14} />
                support@uninotify.ac.rw
              </span>

              <span className="hidden md:block">•</span>

              <span className="hidden md:flex items-center gap-1.5">
                <MapPin size={14} />
                UR-CST, Rwanda
              </span>
            </div>

            <div className="text-center md:text-right">
              Final Year Project by{" "}
              <span className="text-foreground font-semibold">
                Gabiro Jovial Fleuron
              </span>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}
import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Phone, MessageSquare, CheckCircle, XCircle, AlertTriangle, Zap } from "lucide-react";
import adminService from "../../../../services/adminService";
import toast from "react-hot-toast";
import ThemedToaster from "../../../../components/ui/ThemedToaster";

export default function SMSTestPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleTestSMS = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      toast.error("Please enter a phone number");
      return;
    }

    // Validate phone format
    const cleanPhone = phoneNumber.replace(/[\s-\(\)]/g, '');
    if (!/^\+?[1-9]\d{10,15}$/.test(cleanPhone)) {
      toast.error("Invalid phone format. Use E.164 format (e.g., +250788123456)");
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await adminService.testSMS(phoneNumber);
      setResult(response);
      toast.success("Test SMS sent successfully!");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to send test SMS";
      setError({
        message: errorMsg,
        type: err.response?.data?.errorType || "unknown",
        details: err.response?.data?.details
      });
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const presetNumbers = [
    { label: "Rwanda (+250)", value: "+250" },
    { label: "US (+1)", value: "+1" },
    { label: "Kenya (+254)", value: "+254" },
    { label: "Uganda (+256)", value: "+256" },
    { label: "Tanzania (+255)", value: "+255" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-8 lg:p-12">
      <ThemedToaster />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
          <Zap className="text-green-500" size={40} /> SMS Test Center
        </h1>
        <p className="text-muted-foreground mt-2">
          Test your Twilio SMS integration before sending real notifications.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl">
        {/* Test Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border border-border rounded-[24px] p-8 shadow-xl"
        >
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <Phone size={20} className="text-blue-500" /> Test SMS
          </h2>

          <form onSubmit={handleTestSMS} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Phone Number (E.164 Format)
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+250788123456"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:border-blue-500 focus:outline-none transition-colors"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Format: Country code + number (no spaces or dashes)
              </p>
            </div>

            {/* Quick Presets */}
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Quick Select Country Code
              </p>
              <div className="flex flex-wrap gap-2">
                {presetNumbers.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setPhoneNumber(preset.value)}
                    className="px-3 py-1.5 bg-accent hover:bg-accent/80 border border-border rounded-lg text-xs font-bold transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Send size={18} />
                  </motion.div>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send Test SMS
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Results Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-[24px] p-8 shadow-xl"
        >
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <MessageSquare size={20} className="text-purple-500" /> Results
          </h2>

          {/* Success Result */}
          {result && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="text-green-500" size={24} />
                <span className="font-bold text-green-400">
                  {result.mockMode ? 'Mock SMS Sent!' : 'SMS Sent Successfully!'}
                </span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To:</span>
                  <span className="font-mono font-bold">{result.to}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SID:</span>
                  <span className="font-mono text-xs">{result.sid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-bold ${result.mockMode ? 'text-amber-400' : 'text-green-400'}`}>
                    {result.twilioStatus || result.status}
                    {result.mockMode && ' (MOCK)'}
                  </span>
                </div>
                {result.quotaRemaining && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remaining:</span>
                    <span className="font-bold">{result.quotaRemaining}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-mono text-xs">{new Date(result.timestamp || result.dateCreated).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Result */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <XCircle className="text-red-500" size={24} />
                <span className="font-bold text-red-400">SMS Failed</span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="bg-red-500/10 rounded-lg p-3">
                  <p className="font-bold text-red-300">{error.message}</p>
                </div>
                {error.details && (
                  <div className="mt-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Debug Info</p>
                    <pre className="bg-black/50 rounded-lg p-3 text-xs font-mono overflow-x-auto">
                      {JSON.stringify(error.details, null, 2)}
                    </pre>
                  </div>
                )}
                
                {/* Help Tips */}
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Troubleshooting</p>
                  {error.type === "config_error" && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs">
                      <p className="font-bold text-amber-400">Check your .env file:</p>
                      <ul className="mt-2 space-y-1 text-muted-foreground">
                        <li>• TWILIO_SID</li>
                        <li>• TWILIO_AUTH_TOKEN</li>
                        <li>• TWILIO_PHONE_NUMBER</li>
                      </ul>
                    </div>
                  )}
                  {error.type === "invalid_phone" && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs">
                      <p className="font-bold text-amber-400">Valid formats:</p>
                      <ul className="mt-2 space-y-1 text-muted-foreground font-mono">
                        <li>• +250788123456</li>
                        <li>• +12025551234</li>
                      </ul>
                    </div>
                  )}
                  {error.type === "auth_error" && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs">
                      <p className="font-bold text-amber-400">Fix authentication:</p>
                      <ul className="mt-2 space-y-1 text-muted-foreground">
                        <li>• Verify TWILIO_SID is correct</li>
                        <li>• Verify TWILIO_AUTH_TOKEN is correct</li>
                        <li>• Check if Twilio account is active</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!result && !error && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Send size={48} className="text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">
                Enter a phone number and click "Send Test SMS" to verify your Twilio setup.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 max-w-5xl"
      >
        <div className="flex items-start gap-4">
          <AlertTriangle size={24} className="text-blue-400 shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-blue-400 mb-2">Before Testing</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Make sure your Twilio credentials are set in <code className="bg-black/30 px-2 py-0.5 rounded">backend/.env</code></li>
              <li>• Ensure your Twilio account has SMS capability enabled</li>
              <li>• Verify the phone number format (E.164 recommended)</li>
              <li>• Check that you have sufficient SMS credits in your Twilio account</li>
            </ul>
            
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-amber-400 font-bold text-sm">💡 Mock Mode</p>
              <p className="text-muted-foreground text-xs mt-1">
                Add <code className="bg-black/30 px-1 rounded">SMS_MOCK_MODE=true</code> to your .env to test without Twilio.
                Mock mode simulates SMS sending and tracks quota locally.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

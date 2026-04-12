import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Html5Qrcode } from "html5-qrcode";
import eventService from "../../services/eventService";
import toast from "react-hot-toast";

export default function AttendanceScanner({ eventId, onClose, onScanSuccess }) {
  const [scanning, setScanning] = useState(true);
  const [lastScan, setLastScan] = useState(null);
  const [scanner, setScanner] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    let html5QrCode = null;
    
    const startScanner = async () => {
      if (!scanning) return;
      
      try {
        html5QrCode = new Html5Qrcode("qr-reader");
        setScanner(html5QrCode);
        
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          handleScanSuccess,
          onScanFailure
        );
      } catch (err) {
        console.error("[Scanner] Camera start failed:", err);
        toast.error("Camera access denied or unavailable");
        setScanning(false);
      }
    };
    
    startScanner();
    
    // Cleanup on unmount or when scanning changes to false
    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [scanning, eventId]);

const handleScanSuccess = async (decodedText) => {
    // Prevent multiple rapid scans - use ref for fresh value
    if (scannerRef.current?.isScanning === false) return;
    
    // Stop scanner temporarily
    if (scanner && scanner.isScanning) {
      await scanner.stop();
    }
    
    setScanning(false);

    // Parse QR data: expected format { e: "eventId", s: "studentId" }
    let qrData;
    try {
      qrData = JSON.parse(decodedText);
    } catch (e) {
      // If not JSON, assume whole string is studentId
      qrData = { s: decodedText, e: null };
    }

    const studentId = qrData.s;
    if (!studentId) {
      toast.error("Invalid QR code format");
      setScanning(true); // resume scanning
      return;
    }

    // Call backend to mark attendance
    console.log("Scanning attendance for student:", studentId, "event:", eventId);
    try {
      const response = await eventService.scanAttendance(eventId, studentId);
      console.log("Scan response:", response);
      if (response.success) {
        const studentName = response.data?.userId?.name || response.data?.student?.name || "Student";
        setLastScan({ success: true, name: studentName });
        toast.success(`${studentName} marked as attended!`);
        // Notify parent to refresh stats
        if (onScanSuccess) onScanSuccess();
      } else {
        toast.error(response.message || "Failed to record attendance");
        setLastScan({ success: false, message: response.message });
      }
    } catch (error) {
      console.error("Scan error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Scan failed. Please try again.");
      setLastScan({ success: false, message: error.response?.data?.message || error.message });
    } finally {
      // Resume scanning after delay
      setTimeout(() => {
        setLastScan(null);
        setScanning(true);
      }, 3000);
    }
  };

  const onScanFailure = (error) => {
    // Ignore frequent "no QR found" errors
    // console.warn("[Scanner] Scan error:", error);
  };

  const restartScanner = () => {
    setLastScan(null);
    setScanning(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl glass border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <Camera className="text-blue-400" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Attendance Scanner</h2>
                <p className="text-sm text-neutral-400">Point camera at student QR code</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scanner Area */}
          <div className="p-6">
            {scanning && (
              <div className="space-y-4">
                <div
                  id="qr-reader"
                  ref={scannerRef}
                  className="w-full max-w-sm mx-auto rounded-xl overflow-hidden bg-black"
                  style={{ minHeight: "300px" }}
                />
                <p className="text-center text-xs text-neutral-500">
                  Align QR code within the frame
                </p>
              </div>
            )}

            {/* Last Scan Result */}
            <AnimatePresence>
              {lastScan && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mt-6 p-4 rounded-2xl text-center ${
                    lastScan.success
                      ? "bg-emerald-500/10 border border-emerald-500/30"
                      : "bg-red-500/10 border border-red-500/30"
                  }`}
                >
                  {lastScan.success ? (
                    <>
                      <CheckCircle className="mx-auto mb-2 text-emerald-400" size={32} />
                      <p className="text-emerald-400 font-bold">Attendance Recorded</p>
                      <p className="text-neutral-300 text-sm">{lastScan.name}</p>
                    </>
                  ) : (
                    <>
                      <XCircle className="mx-auto mb-2 text-red-400" size={32} />
                      <p className="text-red-400 font-bold">Scan Failed</p>
                      <p className="text-neutral-300 text-sm">{lastScan.message}</p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls */}
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={restartScanner}
                disabled={!scanning}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} />
                Reset Scanner
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * @component EventQR
 * @description Generates a unique check-in QR code for the student containing their student ID.
 * ROLE: Validates physical presence to improve AI recommendation accuracy.
 */
import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import authService from "../../../../services/authService";

export default function EventQR({ eventId }) {
  const [studentId, setStudentId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authService.getCurrentUser();
        if (data.success && data.user) {
          // Use MongoDB _id as that's what backend searches by
          // Fall back to email if _id not available
          const userId = data.user._id || data.user.id;
          // Also include a fallback identifier (studentID or email)
          const identifier = data.user.studentID || data.user.email;
          setStudentId(userId + ':' + identifier);
        }
      } catch (error) {
        console.error("Failed to fetch user for QR:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // QR encodes the eventId and studentId as JSON (compact)
  const qrData = studentId ? JSON.stringify({ e: eventId, s: studentId }) : null;

  if (loading) {
    return (
      <div className="glass p-8 rounded-[40px] border border-border flex flex-col items-center text-center">
        <div className="w-48 h-48 bg-primary/10 rounded-3xl mb-6 animate-pulse flex items-center justify-center">
          <span className="text-muted-foreground text-xs">Loading...</span>
        </div>
      </div>
    );
  }

  if (!studentId) {
    return (
      <div className="glass p-8 rounded-[40px] border border-border flex flex-col items-center text-center">
        <div className="w-48 h-48 bg-primary/10 rounded-3xl mb-6 flex items-center justify-center">
          <span className="text-muted-foreground text-sm">N/A</span>
        </div>
        <h4 className="text-foreground font-bold">Check-in at Event</h4>
        <p className="text-red-400 text-xs mt-2">
          Unable to generate QR. Please log in as a student.
        </p>
      </div>
    );
  }

  return (
    <div className="glass p-8 rounded-[40px] border border-border flex flex-col items-center text-center">
      <div className="w-48 h-48 bg-white rounded-3xl p-4 mb-6 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
        <QRCodeSVG
          value={qrData}
          size={160}
          level="H"
          includeMargin={true}
          className="w-full h-full"
        />
      </div>
      <h4 className="text-foreground font-bold">Check-in at Event</h4>
      <p className="text-muted-foreground text-xs mt-2">
        Show this QR to the event organizer to confirm your attendance.
      </p>
    </div>
  );
}

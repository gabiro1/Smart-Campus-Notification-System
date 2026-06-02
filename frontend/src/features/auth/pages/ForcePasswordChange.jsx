import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Lock, Shield, Loader2, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import authService from "../../../services/authService";
import { useAuth } from "../../../context/AuthContext";

export default function ForcePasswordChange() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [formData, setFormData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const requirements = [
    { label: "At least 6 characters", test: (v) => v.length >= 6 },
    { label: "Contains a number", test: (v) => /\d/.test(v) },
    { label: "Contains a letter", test: (v) => /[a-zA-Z]/.test(v) },
  ];

  const getStrength = (pw) => {
    let score = 0;
    if (pw.length >= 6) score++;
    if (/\d/.test(pw)) score++;
    if (/[a-zA-Z]/.test(pw)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pw)) score++;
    return score;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = formData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (currentPassword === newPassword) {
      toast.error("New password must be different from current");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.changePassword(currentPassword, newPassword);
      if (res?.success) {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = { ...storedUser, mustChangePassword: false };
        login(updatedUser, res.token);
        toast.success("Password changed successfully!");
        const targetRole = user?.role || "student";
        navigate(`/${targetRole}/dashboard`);
      }
    } catch (err) {
      toast.error(err.message || "Failed to change password");
    }
    setLoading(false);
  };

  const strength = getStrength(formData.newPassword);
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-emerald-500"];
  const strengthLabels = ["Weak", "Fair", "Good", "Strong", "Very Strong"];

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <Toaster />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-[32px] p-8 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10 text-center mb-8">
            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield size={32} className="text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Change Your Password</h1>
            <p className="text-muted-foreground text-sm mt-2">
              {user?.name || "User"}, you must change your temporary password before continuing.
            </p>
            {user?.registrationNumber && (
              <p className="text-xs text-muted-foreground mt-1">
                Registration: <span className="font-medium text-foreground">{user.registrationNumber}</span>
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type={showPassword.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                placeholder="Current password"
                className="w-full bg-background border border-border p-4 pl-12 pr-12 rounded-xl focus:border-blue-500 outline-none transition-all placeholder:text-muted-foreground/50"
                required
              />
              <button type="button" onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-blue-500">
                {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type={showPassword.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="New password"
                className="w-full bg-background border border-border p-4 pl-12 pr-12 rounded-xl focus:border-blue-500 outline-none transition-all placeholder:text-muted-foreground/50"
                required
              />
              <button type="button" onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-blue-500">
                {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type={showPassword.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                className="w-full bg-background border border-border p-4 pl-12 pr-12 rounded-xl focus:border-blue-500 outline-none transition-all placeholder:text-muted-foreground/50"
                required
              />
              <button type="button" onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-blue-500">
                {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {formData.newPassword && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < strength ? strengthColors[strength - 1] : "bg-border"}`} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-right">Strength: {strengthLabels[strength] || "None"}</p>
                <div className="space-y-1">
                  {requirements.map((req) => (
                    <div key={req.label} className="flex items-center gap-2 text-xs">
                      {req.test(formData.newPassword) ? (
                        <CheckCircle size={12} className="text-emerald-500" />
                      ) : (
                        <XCircle size={12} className="text-muted-foreground" />
                      )}
                      <span className={req.test(formData.newPassword) ? "text-emerald-500" : "text-muted-foreground"}>{req.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <XCircle size={12} /> Passwords do not match
              </p>
            )}

            <button
              type="submit"
              disabled={loading || (formData.newPassword !== formData.confirmPassword)}
              className="w-full bg-blue-500 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Change Password & Continue"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Globe, Bell, Shield, Moon, Lock, Eye, EyeOff, Loader2, LogOut, Trash2, Mail, CheckCircle2, XCircle, AlertTriangle, Clock, HelpCircle, Send, Paperclip, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import authService from "../../../../../services/authService";
import apiClient from "../../../../../services/apiClient";
import supportService from "../../../../../services/supportService";
import LanguageToggle from "../../../../../components/ui/LanguageToggle";

export default function Settings() {
  const [preferences, setPreferences] = useState({
    push: true,
    email: true,
    sms: false,
    digestEnabled: true,
    categories: {
      events: { push: true, email: true, sms: false },
      reminders: { push: true, email: true, sms: false },
      governance: { push: true, email: true, sms: false }
    }
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Quiet Hours State
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHours, setQuietHours] = useState({ startTime: "22:00", endTime: "07:00" });
  
  // Password Change State
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Delete Account Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Support Tickets State
  const [showSupportSection, setShowSupportSection] = useState(false);
  const [myTickets, setMyTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    category: 'bug',
    subject: '',
    description: ''
  });
  const [submittingTicket, setSubmittingTicket] = useState(false);

  useEffect(() => {
    loadPreferences();
    loadMyTickets();
  }, []);

  // Load my tickets
  const loadMyTickets = async () => {
    try {
      setTicketsLoading(true);
      const response = await supportService.getMyTickets();
      if (response.success) {
        setMyTickets(response.tickets || []);
      }
    } catch (error) {
      console.error("Failed to load tickets:", error);
    } finally {
      setTicketsLoading(false);
    }
  };

  // Submit support ticket
  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!ticketForm.subject || !ticketForm.description) {
      toast.error("Please fill in subject and description");
      return;
    }
    setSubmittingTicket(true);
    try {
      const response = await supportService.submitTicket(ticketForm);
      if (response.success) {
        toast.success("Ticket submitted successfully!");
        setTicketForm({ category: 'bug', subject: '', description: '' });
        loadMyTickets();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit ticket");
    } finally {
      setSubmittingTicket(false);
    }
  };

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await authService.getCurrentUser();
      if (data.success && data.user) {
        setUser(data.user);
        if (data.user.notificationPreferences) {
          setPreferences(data.user.notificationPreferences);
        }
        // Quiet Hours
        if (data.user.quietHours?.startTime && data.user.quietHours?.endTime) {
          setQuietHoursEnabled(true);
          setQuietHours({
            startTime: data.user.quietHours.startTime,
            endTime: data.user.quietHours.endTime
          });
        }
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key, value) => {
    const oldPrefs = { ...preferences };
    try {
      setPreferences(prev => ({ ...prev, [key]: value }));
      await authService.updateNotificationPreferences({ [key]: value });
      toast.success("Preferences saved");
    } catch (error) {
      setPreferences(oldPrefs);
      toast.error("Failed to save preferences");
    }
  };

  const updateCategoryPreference = (category, channel, value) => {
    const oldPrefs = { ...preferences };
    const newCategories = { ...preferences.categories };
    newCategories[category] = { ...newCategories[category], [channel]: value };
    setPreferences(prev => ({ ...prev, categories: newCategories }));

    authService.updateNotificationPreferences({
      categories: { [category]: { [channel]: value } }
    })
      .then(() => toast.success("Preferences saved"))
      .catch(() => {
        setPreferences(oldPrefs);
        toast.error("Failed to save preferences");
      });
  };

  // Save Quiet Hours
  const saveQuietHours = async () => {
    try {
      await apiClient.put('/users/profile', {
        quietHours: quietHoursEnabled ? quietHours : { startTime: null, endTime: null }
      });
      toast.success("Quiet hours updated!");
    } catch (error) {
      toast.error("Failed to update quiet hours");
    }
  };

  // Handle Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setChangingPassword(true);
    try {
      await apiClient.put('/users/update', {
        currentPassword: passwordData.currentPassword,
        password: passwordData.newPassword
      });
      toast.success("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await apiClient.post('/users/logout');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      toast.success("Logged out successfully!");
      window.location.href = '/login';
    } catch (error) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  // Handle Delete Account
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error("Please enter your password to confirm");
      return;
    }
    setDeleting(true);
    try {
      await apiClient.delete(`/users/profile/${user?._id}`, {
        data: { password: deletePassword }
      });
      toast.success("Account deleted");
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  // Resend Verification Email
  const handleResendVerification = async () => {
    try {
      await apiClient.post('/users/request-verification');
      toast.success("Verification email sent!");
    } catch (error) {
      toast.error("Failed to send verification email");
    }
  };

  // Format last digest date
  const formatLastDigest = (date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="pt-24 px-6 pb-20 max-w-2xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-primary/10 rounded w-1/3"></div>
          <div className="h-40 bg-accent rounded-[32px]"></div>
          <div className="h-64 bg-accent rounded-[32px]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 px-6 pb-20 max-w-2xl mx-auto space-y-8">
      <h2 className="text-3xl font-black text-foreground italic tracking-tighter uppercase">
        Settings
      </h2>

      {/* Section 1: Language */}
      <section className="glass p-6 rounded-[32px] border border-border space-y-4">
        <div className="flex items-center gap-3 text-blue-400">
          <Globe size={20} />
          <h3 className="font-bold text-sm uppercase tracking-widest">Notification Language</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Announcements are auto-translated into your preferred language.
        </p>
        <div className="flex gap-3">
          <LanguageToggle
            initialLanguage={user?.languagePreference || "en"}
            onLanguageChange={(lang) => {
              setUser(prev => prev ? { ...prev, languagePreference: lang } : null);
              apiClient.put('/users/profile', { languagePreference: lang });
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Current: {user?.languagePreference === "en" ? "English" : "Kinyarwanda"}
        </p>
      </section>

      {/* Section 2: Notification Channels */}
      <section className="glass p-6 rounded-[32px] border border-border space-y-4">
        <div className="flex items-center gap-3 text-blue-400">
          <Bell size={20} />
          <h3 className="font-bold text-sm uppercase tracking-widest">Notification Channels</h3>
        </div>
        <ToggleRow
          label="Push Notifications"
          description="Receive alerts on this device"
          active={preferences.push}
          onChange={(value) => updatePreference('push', value)}
        />
        <ToggleRow
          label="Email Notifications"
          description="Receive alerts via email"
          active={preferences.email}
          onChange={(value) => updatePreference('email', value)}
        />
        <ToggleRow
          label="SMS Notifications"
          description="Receive alerts via SMS (charges may apply)"
          active={preferences.sms}
          onChange={(value) => updatePreference('sms', value)}
        />
      </section>

      {/* Section 3: Category Preferences */}
      <section className="glass p-6 rounded-[32px] border border-border space-y-4">
        <div className="flex items-center gap-3 text-purple-400">
          <Bell size={20} />
          <h3 className="font-bold text-sm uppercase tracking-widest">Category Preferences</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Customize which channels you receive for each notification type.
        </p>
        {['events', 'reminders', 'governance'].map((category) => (
          <div key={category} className="border-t border-border pt-4 first:border-0 first:pt-0">
            <h4 className="text-sm font-bold text-foreground mb-3 capitalize">{category}</h4>
            <div className="grid grid-cols-3 gap-4">
              <ChannelToggle
                label="Push"
                active={preferences.categories[category]?.push ?? preferences.push}
                onChange={(val) => updateCategoryPreference(category, 'push', val)}
              />
              <ChannelToggle
                label="Email"
                active={preferences.categories[category]?.email ?? preferences.email}
                onChange={(val) => updateCategoryPreference(category, 'email', val)}
              />
              <ChannelToggle
                label="SMS"
                active={preferences.categories[category]?.sms ?? preferences.sms}
                onChange={(val) => updateCategoryPreference(category, 'sms', val)}
              />
            </div>
          </div>
        ))}
      </section>

      {/* Section 4: Quiet Hours */}
      <section className="glass p-6 rounded-[32px] border border-border space-y-4">
        <div className="flex items-center gap-3 text-indigo-400">
          <Moon size={20} />
          <h3 className="font-bold text-sm uppercase tracking-widest">Quiet Hours (Do Not Disturb)</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Suppress low/medium priority notifications during rest hours. Critical alerts always come through.
        </p>
        <ToggleRow
          label="Enable Quiet Hours"
          description="Pause non-critical notifications"
          active={quietHoursEnabled}
          onChange={(value) => {
            setQuietHoursEnabled(value);
            if (value) saveQuietHours();
          }}
        />
        {quietHoursEnabled && (
          <div className="space-y-3 mt-4 p-4 bg-accent rounded-xl">
            <div className="flex items-center gap-4">
              <label className="text-xs text-muted-foreground w-16">Start:</label>
              <input
                type="time"
                value={quietHours.startTime}
                onChange={(e) => setQuietHours(prev => ({ ...prev, startTime: e.target.value }))}
                onBlur={saveQuietHours}
                className="bg-primary/10 border border-border rounded-lg px-3 py-2 text-foreground text-sm"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-xs text-muted-foreground w-16">End:</label>
              <input
                type="time"
                value={quietHours.endTime}
                onChange={(e) => setQuietHours(prev => ({ ...prev, endTime: e.target.value }))}
                onBlur={saveQuietHours}
                className="bg-primary/10 border border-border rounded-lg px-3 py-2 text-foreground text-sm"
              />
            </div>
            <p className="text-[10px] text-amber-400 mt-2 flex items-center gap-1">
              <AlertTriangle size={12} />
              Emergency & critical alerts will still reach you during quiet hours.
            </p>
          </div>
        )}
      </section>

      {/* Section 5: Daily Digest */}
      <section className="glass p-6 rounded-[32px] border border-border space-y-4">
        <div className="flex items-center gap-3 text-cyan-400">
          <Mail size={20} />
          <h3 className="font-bold text-sm uppercase tracking-widest">Daily Digest Email</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Get an AI summary of your notifications delivered to your email.
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground font-medium">Enable Digest Email</p>
            <p className="text-[10px] text-muted-foreground">Last digest: {formatLastDigest(user?.lastDigestAt)}</p>
          </div>
          <ToggleRow
            label=""
            description=""
            active={user?.digestEnabled !== false}
            onChange={(value) => {
              setUser(prev => prev ? { ...prev, digestEnabled: value } : null);
              apiClient.put('/users/profile', { digestEnabled: value });
              toast.success(value ? "Digest enabled" : "Digest disabled");
            }}
          />
        </div>
      </section>

      {/* Section 6: Security & Password */}
      <section className="glass p-6 rounded-[32px] border border-border space-y-4">
        <div className="flex items-center gap-3 text-emerald-400">
          <Lock size={20} />
          <h3 className="font-bold text-sm uppercase tracking-widest">Security</h3>
        </div>
        
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-foreground uppercase">Change Password</h4>
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <input
              type={showPasswords ? "text" : "password"}
              placeholder="Current Password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50"
              required
            />
            <input
              type={showPasswords ? "text" : "password"}
              placeholder="New Password (min 6 characters)"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50"
              required
              minLength={6}
            />
            <input
              type={showPasswords ? "text" : "password"}
              placeholder="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50"
              required
            />
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
                {showPasswords ? "Hide" : "Show"} passwords
              </button>
              <button
                type="submit"
                disabled={changingPassword}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-foreground rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
              >
                {changingPassword && <Loader2 size={16} className="animate-spin" />}
                Update Password
              </button>
            </div>
          </form>
        </div>

        <div className="border-t border-border pt-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {user?.emailVerified ? (
                <CheckCircle2 size={16} className="text-emerald-400" />
              ) : (
                <XCircle size={16} className="text-red-400" />
              )}
              <div>
                <p className="text-sm text-foreground font-medium">Email Verification</p>
                <p className="text-[10px] text-muted-foreground">
                  Status: {user?.emailVerified ? "Verified" : "Not Verified"}
                </p>
              </div>
            </div>
            {!user?.emailVerified && (
              <button
                onClick={handleResendVerification}
                className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-foreground text-xs font-bold rounded-lg transition-colors"
              >
                Resend Email
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Section 7: Danger Zone */}
      <section className="glass p-6 rounded-[32px] border border-red-500/30 bg-red-500/5 space-y-4">
        <div className="flex items-center gap-3 text-red-400">
          <AlertTriangle size={20} />
          <h3 className="font-bold text-sm uppercase tracking-widest">Danger Zone</h3>
        </div>
        
        <div className="space-y-4">
          {/* Logout */}
          <div className="flex items-center justify-between p-4 bg-accent rounded-xl">
            <div>
              <p className="text-sm text-foreground font-medium">Log Out</p>
              <p className="text-[10px] text-muted-foreground">Sign out of this device</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 border border-red-500/50 hover:bg-red-500/20 text-red-400 text-sm font-bold rounded-lg transition-colors"
            >
              <LogOut size={16} />
              Log Out
            </button>
          </div>
          
          {/* Delete Account */}
          <div className="flex items-center justify-between p-4 bg-accent rounded-xl">
            <div>
              <p className="text-sm text-foreground font-medium">Delete Account</p>
              <p className="text-[10px] text-muted-foreground">Permanently remove your account and all data</p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-foreground text-sm font-bold rounded-lg transition-colors"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      </section>

      {/* Section 8: Help & Support */}
      <section className="glass p-6 rounded-[32px] border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-cyan-400">
            <HelpCircle size={20} />
            <h3 className="font-bold text-sm uppercase tracking-widest">Help & Support</h3>
          </div>
          <button
            onClick={() => setShowSupportSection(!showSupportSection)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown size={20} className={`transition-transform ${showSupportSection ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        {showSupportSection && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">Something broken? Let us know.</p>
            
            {/* Ticket Form */}
            <form onSubmit={handleSubmitTicket} className="space-y-3">
              <select
                value={ticketForm.category}
                onChange={(e) => setTicketForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-cyan-500/50"
              >
                <option value="bug">Bug Report</option>
                <option value="feature_request">Feature Request</option>
                <option value="login_issue">Login Issue</option>
                <option value="notification_problem">Notification Problem</option>
                <option value="other">Other</option>
              </select>
              <input
                type="text"
                placeholder="Subject"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-cyan-500/50"
                required
              />
              <textarea
                placeholder="Describe what happened..."
                value={ticketForm.description}
                onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-cyan-500/50 min-h-[100px] resize-none"
                required
              />
              <button
                type="submit"
                disabled={submittingTicket}
                className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-600 hover:bg-cyan-500 text-foreground rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
              >
                {submittingTicket ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                Submit Report
              </button>
            </form>

            {/* My Tickets */}
            {myTickets.length > 0 && (
              <div className="border-t border-border pt-4 mt-4">
                <h4 className="text-xs font-bold text-foreground uppercase mb-3">My Reports</h4>
                <div className="space-y-2">
                  {myTickets.slice(0, 5).map((ticket) => (
                    <div key={ticket._id} className="p-3 bg-accent rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${
                          ticket.status === 'open' ? 'bg-blue-500' :
                          ticket.status === 'in_review' ? 'bg-yellow-500' :
                          ticket.status === 'resolved' ? 'bg-green-500' : 'bg-neutral-500'
                        }`} />
                        <span className="text-[10px] font-bold text-muted-foreground">#{ticket.ticketNumber}</span>
                        <span className="text-[10px] font-medium text-foreground truncate flex-1">{ticket.subject}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground capitalize">
                        {ticket.status.replace('_', ' ')} {ticket.adminReply && '• Replied'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Critical Alerts Info */}
      <section className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-[24px] text-sm">
        <p className="text-amber-400">
          <strong>Critical Alerts:</strong> In emergencies, administrators can send priority-critical notifications that bypass your preferences to ensure you receive essential information.
        </p>
      </section>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-red-500/30 rounded-3xl p-8 max-w-md w-full">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <AlertTriangle size={24} />
              <h3 className="text-xl font-bold">Delete Account</h3>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <input
              type="password"
              placeholder="Enter your password to confirm"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full bg-primary/10 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-red-500/50 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                }}
                className="flex-1 py-3 border border-border text-muted-foreground rounded-xl font-bold text-sm hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-foreground rounded-xl font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 size={16} className="animate-spin" />}
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Toggle Row Component
function ToggleRow({ label, description, active, onChange }) {
  return (
    <div className="flex items-center justify-between p-2">
      <div>
        <p className="text-foreground text-sm font-bold">{label}</p>
        {description && <p className="text-[10px] text-muted-foreground">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!active)}
        className={`w-12 h-6 rounded-full relative transition-colors ${active ? "bg-blue-600" : "bg-neutral-800"}`}
        aria-pressed={active}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? "right-1" : "left-1"}`}
        />
      </button>
    </div>
  );
}

// Channel Toggle Component
function ChannelToggle({ label, active, onChange }) {
  return (
    <button
      onClick={() => onChange(!active)}
      className={`py-2 px-4 rounded-xl text-xs font-bold border transition-all ${
        active
          ? "bg-blue-600 border-blue-500 text-foreground"
          : "bg-accent border-border text-muted-foreground hover:bg-primary/10"
      }`}
    >
      {label}
    </button>
  );
}

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import Skeleton from "../../../../../components/ui/Skeleton";
import toast from "react-hot-toast";
import notificationService from "../../../../../services/notificationService";

export const NotificationsTab = ({
  notifications = [],
  notifFilter = "all",
  loading = { notifs: false },
  setNotifFilter,
  markAllRead,
  markRead,
  deleteNotif,
  ago,
}) => {
  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  // AI Digest state
  const [showDigestModal, setShowDigestModal] = useState(false);
  const [digestSummary, setDigestSummary] = useState(null);
  const [digestLoading, setDigestLoading] = useState(false);
  const [digestPeriod, setDigestPeriod] = useState('weekly');
  const [digestError, setDigestError] = useState(null);

  const filteredNotifs = notifications.filter(
    (n) => notifFilter === "all" || n.status === notifFilter,
  );

  const icons = {
    bell: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    check: "M5 13l4 4L19 7",
    x: "M6 18L18 6M6 6l12 12",
  };

  // AI Digest Handler
  const handleGenerateDigest = async () => {
    try {
      setDigestError(null);
      setDigestLoading(true);
      setShowDigestModal(true);
      setDigestSummary(null);

      const result = await notificationService.generateDigest(digestPeriod);
      console.log('Digest result:', result);

      if (result.success) {
        setDigestSummary(result.summary || 'No notifications to summarize. You\'re all caught up!');
        toast.success('AI digest generated successfully!');
      } else {
        setDigestError(result.message || 'Failed to generate digest');
        toast.error(result.message || 'Failed to generate digest');
      }
    } catch (error) {
      console.error('Digest generation failed:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to generate digest. Please try again.';
      setDigestError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setDigestLoading(false);
    }
  };

  return (
    <div className="p-7 ml-75 max-w-[900px] mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-[22px] font-extrabold text-slate-100 tracking-tight">
            Notifications
          </h2>
          <p className="text-gray-600 text-[13px] mt-1">{unreadCount} unread</p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              className="bg-transparent border border-gray-800 rounded-[10px] px-4 py-[9px] text-gray-400 text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-gray-800/50 hover:text-gray-300 transition-colors"
              onClick={markAllRead}
            >
              <Icon icon={icons.check} width={14} height={14} /> Mark all read
            </button>
          )}
          <button
            className="bg-blue-600 hover:bg-blue-700 border border-blue-500 rounded-[10px] px-4 py-[9px] text-white text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleGenerateDigest}
            disabled={digestLoading}
          >
            <Icon icon="mdi:sparkles" width={14} height={14} />
            {digestLoading ? 'Generating...' : 'Generate AI Summary'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5">
        {["all", "unread", "read"].map((f) => (
          <button
            key={f}
            onClick={() => setNotifFilter(f)}
            className={`px-4 py-[7px] rounded-full border text-xs font-bold cursor-pointer transition-colors
              ${
                notifFilter === f
                  ? "bg-[#1e3a5f] border-blue-600 text-blue-400"
                  : "bg-transparent border-[#2d3748] text-gray-500 hover:text-gray-300 hover:border-gray-600"
              }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading.notifs ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-[#0d1117] border border-gray-800 rounded-2xl p-5"
            >
              <Skeleton h={16} w="50%" />
              <div className="mt-2">
                <Skeleton h={13} />
              </div>
            </div>
          ))}
        </div>
      ) : filteredNotifs.length === 0 ? (
        <div className="bg-[#0d1117] border border-gray-800 rounded-2xl p-12 text-center">
          <Icon
            icon={icons.bell}
            width={36}
            height={36}
            className="text-gray-700 mx-auto mb-3 block"
          />
          <p className="text-gray-500 text-sm">No notifications here</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filteredNotifs.map((n) => (
            <div
              key={n._id}
              onClick={() => markRead(n)}
              className={`bg-[#0d1117] border border-gray-800 border-l-[3px] rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:bg-[#161b22] 
                ${n.status === "unread" ? "border-l-blue-500" : "border-l-transparent"} 
                ${n.status === "read" ? "opacity-70" : "opacity-100"}`}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    {n.status === "unread" && (
                      <span className="w-[7px] h-[7px] rounded-full bg-blue-500 inline-block shrink-0" />
                    )}
                    <span className="text-sm font-bold text-slate-100">
                      {n.title}
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-400 leading-relaxed mb-1.5">
                    {n.message}
                  </p>
                  <span className="text-[11px] text-gray-600">
                    {ago ? ago(n.createdAt) : n.createdAt}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotif(n._id);
                  }}
                  className="bg-transparent border-none cursor-pointer text-gray-700 p-1 rounded-md hover:bg-gray-800 hover:text-gray-400 transition-colors"
                >
                  <Icon icon={icons.x} width={14} height={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Digest Modal */}
      {showDigestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-[#0d1117] border border-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#111]">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Icon icon="mdi:sparkles" className="text-blue-400" width={20} />
                  AI Digest Summary
                </h3>
                <p className="text-gray-500 text-xs mt-1">
                  Your personalized briefing for the past {digestPeriod}
                </p>
              </div>
              <button
                onClick={() => setShowDigestModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Icon icon={icons.x} width={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {digestLoading ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                      <p className="text-gray-400 text-sm font-medium">
                        Generating your digest...
                      </p>
                      <p className="text-gray-600 text-xs">
                        Analyzing your unread notifications with AI
                      </p>
                    </div>
                  </div>
                  {/* Skeleton preview */}
                  <div className="space-y-3">
                    <Skeleton h={16} />
                    <Skeleton h={16} w="90%" />
                    <Skeleton h={16} w="85%" />
                    <Skeleton h={16} w="95%" />
                  </div>
                </div>
              ) : digestError ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mb-4">
                    <Icon icon="mdi:alert-circle" className="text-red-500" width={32} />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">
                    Unable to Generate Digest
                  </h4>
                  <p className="text-gray-400 text-sm max-w-md mx-auto">
                    {digestError}
                  </p>
                </div>
              ) : digestSummary ? (
                <div className="prose prose-invert max-w-none">
                  <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-line text-[15px]">
                      {digestSummary}
                    </p>
                  </div>
                  <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <p className="text-green-400 text-xs flex items-center gap-2">
                      <Icon icon="mdi:email-check" width={16} />
                      A copy of this digest has been sent to your registered email address.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-800 bg-[#111] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <label className="text-gray-400 text-xs font-medium">Period:</label>
                <select
                  value={digestPeriod}
                  onChange={(e) => setDigestPeriod(e.target.value)}
                  className="bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDigestModal(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Close
                </button>
                {!digestLoading && !digestSummary && (
                  <button
                    onClick={handleGenerateDigest}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Icon icon="mdi:refresh" width={14} />
                    Regenerate
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

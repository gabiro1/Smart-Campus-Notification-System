import React from "react";
import { Icon } from "@iconify/react";
import Skeleton from "../../../../../components/ui/Skeleton";

export const NotificationsTab = ({
  notifications = [],
  events = [],
  searchQ = "",
  eventFilter = "all",
  notifFilter = "all",
  loading = { notifs: false },
  setNotifFilter,
  markAllRead,
  markRead,
  deleteNotif,
  ago,
  Skeleton,
}) => {
  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  const filteredNotifs = notifications.filter(
    (n) => notifFilter === "all" || n.status === notifFilter,
  );

  const icons = {
    bell: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    check: "M5 13l4 4L19 7",
    x: "M6 18L18 6M6 6l12 12",
  };

  const filteredEvents = events.filter((e) => {
    const q = searchQ.toLowerCase();
    const matchQ =
      !q ||
      e.title?.toLowerCase().includes(q) ||
      e.description?.toLowerCase().includes(q) ||
      e.department?.toLowerCase().includes(q);
    const matchF =
      eventFilter === "all" ||
      (eventFilter === "interested" && e.interested) ||
      (eventFilter === "top" && e.matchScore >= 80);
    return matchQ && matchF;
  });

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

        {unreadCount > 0 && (
          <button
            className="bg-transparent border border-gray-800 rounded-[10px] px-4 py-[9px] text-gray-400 text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-gray-800/50 hover:text-gray-300 transition-colors"
            onClick={markAllRead}
          >
            <Icon icon={icons.check} width={14} height={14} /> Mark all read
          </button>
        )}
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
    </div>
  );
};

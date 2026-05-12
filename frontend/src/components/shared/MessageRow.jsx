import { useState } from "react";
import AvatarInitials from "./AvatarInitials";

export default function MessageRow({ sender, role, preview, time, isUnread: initialUnread, onClick }) {
  const [unread, setUnread] = useState(initialUnread);

  const handleClick = () => {
    if (unread) setUnread(false);
    if (onClick) onClick();
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-3 bg-card border border-border rounded-lg p-3 cursor-pointer transition-all duration-150 hover:bg-accent"
    >
      <AvatarInitials name={sender} size={32} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`text-[13px] ${
              unread ? "font-medium" : "font-normal"
            } text-foreground truncate`}
          >
            {sender}
          </span>
          <span className="text-[11px] text-muted-foreground shrink-0">{role}</span>
        </div>
        <p className="text-[13px] text-muted-foreground truncate max-w-[260px]">
          {preview}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-[12px] text-muted-foreground">{time}</span>
        {unread && (
          <span className="w-[6px] h-[6px] rounded-full bg-[#4ADE80]" />
        )}
      </div>
    </div>
  );
}

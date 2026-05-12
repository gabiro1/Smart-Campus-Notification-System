import { useNavigate } from "react-router-dom";
import { Inbox } from "lucide-react";
import MessageRow from "../shared/MessageRow";

const defaultMessages = [
  { id: 1, sender: "Dr. Mutoni Claire", role: "Lecturer", preview: "Please note the lab room change for today's session...", time: "09:15", isUnread: true },
  { id: 2, sender: "Registrar Office", role: "Admin", preview: "Your semester fee statement is now available for download.", time: "08:40", isUnread: true },
  { id: 3, sender: "Dr. Habimana Eric", role: "Lecturer", preview: "Assignment 2 feedback has been posted to the portal.", time: "Yesterday", isUnread: false },
];

export default function InboxPreview({ messages: propMessages }) {
  const navigate = useNavigate();
  const messages = propMessages && propMessages.length > 0 ? propMessages : defaultMessages;
  const unreadCount = messages.filter((m) => m.isUnread).length;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-[15px] font-medium text-foreground">Inbox</h3>
        <span className="flex items-center gap-1 text-[12px] text-[#4ADE80]">
          <Inbox size={12} /> {unreadCount} unread
        </span>
      </div>
      <div className="space-y-0.5">
        {messages.map((msg) => (
          <MessageRow
            key={msg.id}
            sender={msg.sender}
            role={msg.role}
            preview={msg.preview}
            time={msg.time}
            isUnread={msg.isUnread}
          />
        ))}
      </div>
      <p
        onClick={() => navigate("/inbox")}
        className="text-[13px] text-muted-foreground text-right mt-2 cursor-pointer hover:text-foreground transition-colors"
      >
        View all messages →
      </p>
    </div>
  );
}

import { useState, useEffect } from "react";
import { NotificationsTab } from "./NotificationsTab";

export default function NotificationsPage() {
  const [notifFilter, setNotifFilter] = useState("all");

  return (
    <NotificationsTab
      notifFilter={notifFilter}
      setNotifFilter={setNotifFilter}
    />
  );
}
import { useState } from "react";
import GreetingSection from "../../../../../components/dashboard/GreetingSection";
import UrgentAlertBanner from "../../../../../components/dashboard/UrgentAlertBanner";
import StatCards from "../../../../../components/dashboard/StatCards";
import NextClassCard from "../../../../../components/dashboard/NextClassCard";
import DeadlinesCard from "../../../../../components/dashboard/DeadlinesCard";
import InboxPreview from "../../../../../components/dashboard/InboxPreview";
import AnnouncementsPanel from "../../../../../components/dashboard/AnnouncementsPanel";
import TodaySchedule from "../../../../../components/dashboard/TodaySchedule";
import FeedbackModal from "../../../../../components/dashboard/FeedbackModal";
import useOfflineCache from "../../../../../hooks/useOfflineCache";

export default function Dashboard() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const { isOffline } = useOfflineCache();

  return (
    <div className="min-h-screen bg-background">
      {isOffline && (
        <div className="flex items-center justify-center gap-2 bg-muted border-b border-border py-2 px-4 text-[12px] text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-destructive shrink-0" />
          Offline mode — showing cached schedule
        </div>
      )}

      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1200px] mx-auto space-y-6">
          <GreetingSection />

          <UrgentAlertBanner message="Urgent: Advanced Programming Lab moved to Lab 4 — effective today" />

          <StatCards />

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
            <div className="space-y-6">
              <NextClassCard />
              <DeadlinesCard />
              <InboxPreview />

              <p
                onClick={() => setFeedbackOpen(true)}
                className="text-[12px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              >
                Give feedback on last event →
              </p>
            </div>

            <div className="space-y-6">
              <AnnouncementsPanel />
              <TodaySchedule />
            </div>
          </div>
        </div>
      </main>

      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        eventName="Advanced Programming Workshop"
      />
    </div>
  );
}

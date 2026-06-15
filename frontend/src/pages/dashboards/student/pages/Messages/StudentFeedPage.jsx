import StudentFeedTab from "./StudentFeedTab";

export default function StudentFeedPage() {
  return (
    <div className="p-6 w-full">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Feed</h1>
        <p className="text-sm text-muted-foreground">Announcements and class updates</p>
      </div>
      <StudentFeedTab />
    </div>
  );
}

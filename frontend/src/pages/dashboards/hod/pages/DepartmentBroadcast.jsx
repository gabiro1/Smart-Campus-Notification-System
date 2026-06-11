import AnnouncementForm from "../../../../components/governance/AnnouncementForm";

export default function DepartmentBroadcast() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Department Broadcast</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Send official announcements to your department or request approval for wider reach.
        </p>
      </div>

      <AnnouncementForm />
    </div>
  );
}

import StudentQATab from "./StudentQATab";

export default function StudentQAPage() {
  return (
    <div className="p-6 w-full">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Questions</h1>
        <p className="text-sm text-muted-foreground">Your asked questions and replies</p>
      </div>
      <StudentQATab />
    </div>
  );
}

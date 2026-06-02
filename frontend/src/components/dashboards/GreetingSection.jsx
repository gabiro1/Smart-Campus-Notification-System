import { useAuth } from "../../context/AuthContext";

export default function GreetingSection() {
  const { user } = useAuth();
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  const getFirstName = (name) => {
    if (!name) return "Student";
    return name.split(" ")[0].toUpperCase();
  };
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
        <span className="w-[6px] h-[6px] rounded-full bg-[#4ADE80]" />
        {today}
      </div>
      <h1 className="text-xl sm:text-2xl lg:text-[26px] font-semibold text-foreground">
        {getGreeting()}, {getFirstName(user?.name)}
      </h1>
    </div>
  );
}

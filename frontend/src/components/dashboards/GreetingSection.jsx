import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

export default function GreetingSection({
  subtitle = "Manage campus communications efficiently.",
}) {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getFirstName = (name) => {
    if (!name) return "there";
    return name.split(" ")[0];
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="space-y-1 mb-8"
    >
      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <span>{today}</span>
      </div>
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
        {getGreeting()},{" "}
        <span className="text-blue-400">{getFirstName(user?.name)}</span>
      </h1>
      <p className="text-muted-foreground text-sm">{subtitle}</p>
    </motion.div>
  );
}

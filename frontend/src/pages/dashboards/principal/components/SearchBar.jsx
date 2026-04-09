import { Search } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search system...",
}) {
  return (
    <div className="relative w-full max-w-md">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        size={16}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-muted-foreground"
      />
    </div>
  );
}

import { GraduationCap, Clock, MapPin } from "lucide-react";

export default function NextClassCard({ classData }) {
  const data = classData || {
    title: "Advanced Programming Lecture",
    time: "09:00",
    location: "Lab 4",
    minutesUntil: 45,
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
        <GraduationCap size={14} />
        <span>Next Class</span>
      </div>
      <h3 className="text-[15px] font-medium text-foreground mt-2.5">
        {data.title}
      </h3>
      <div className="flex flex-wrap items-center gap-4 mt-2 text-[13px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock size={13} /> {data.time}
        </span>
        <span className="flex items-center gap-1">
          <MapPin size={13} /> {data.location}
        </span>
      </div>
      <span className="inline-block mt-2.5 bg-[#4ADE80]/10 text-[#4ADE80] text-[12px] rounded px-2 py-0.5">
        Starts in {data.minutesUntil} min
      </span>
    </div>
  );
}

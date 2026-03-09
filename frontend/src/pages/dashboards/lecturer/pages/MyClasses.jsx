import GlassCard from "../components/GlassCard";
import { Users, GraduationCap, TrendingUp, MoreHorizontal } from "lucide-react";

const classes = [
  {
    id: "CS101",
    name: "Intro to Computer Science",
    students: 142,
    attendance: "94%",
    trend: "+2%",
  },
  {
    id: "ENG201",
    name: "Engineering Mathematics",
    students: 85,
    attendance: "88%",
    trend: "-1%",
  },
  {
    id: "SWE304",
    name: "Software Architecture",
    students: 64,
    attendance: "97%",
    trend: "+5%",
  },
];

export default function MyClasses() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
          My Classes
        </h1>
        <p className="text-neutral-400">
          Monitor attendance and student lists for your modules.
        </p>
      </header>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {classes.map((cls, idx) => (
          <GlassCard
            key={cls.id}
            delay={idx * 0.1}
            className="flex flex-col relative group cursor-pointer"
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="text-neutral-400 hover:text-white">
                <MoreHorizontal size={20} />
              </button>
            </div>

            <div className="p-3 bg-blue-500/10 w-fit rounded-xl border border-blue-500/20 mb-4 group-hover:scale-110 transition-transform duration-500">
              <GraduationCap size={24} className="text-blue-400" />
            </div>

            <h3 className="text-xl font-bold text-white mb-1">{cls.name}</h3>
            <p className="text-sm text-neutral-400 font-medium mb-6">
              {cls.id}
            </p>

            <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-white/10">
              <div>
                <p className="text-xs text-neutral-500 mb-1">Students</p>
                <p className="text-lg font-semibold text-white flex items-center gap-2">
                  <Users size={14} className="text-blue-400" /> {cls.students}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Avg. Attendance</p>
                <p className="text-lg font-semibold text-white flex items-center gap-2">
                  <TrendingUp
                    size={14}
                    className={
                      cls.trend.startsWith("+")
                        ? "text-emerald-400"
                        : "text-red-400"
                    }
                  />
                  {cls.attendance}
                </p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Roster / Detail Area */}
      <GlassCard
        delay={0.4}
        className="min-h-[300px] flex items-center justify-center border-dashed"
      >
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto border border-white/5">
            <Users size={24} className="text-neutral-500" />
          </div>
          <p className="text-neutral-400 font-medium">
            Select a class card above to view the detailed student roster.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}

import StatCard from "../components/StatCard";
import GlassCard from "../components/GlassCard";
import { Megaphone, CheckCircle2, Eye, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            Overview
          </h1>
          <p className="text-neutral-400">
            Track announcement engagement and class metrics.
          </p>
        </div>
        <Link
          to="/lecturer/create"
          className="bg-white hover:bg-neutral-200 text-black px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] flex items-center gap-2"
        >
          <Megaphone size={16} /> Create Announcement
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          label="Announcements Sent"
          value="128"
          icon={Megaphone}
          trend="This Semester"
          delay={0.1}
        />
        <StatCard
          label="Delivery Rate"
          value="99.2%"
          icon={CheckCircle2}
          trend="Optimal"
          delay={0.2}
        />
        <StatCard
          label="Avg. Open Rate"
          value="76%"
          icon={Eye}
          trend="+4% vs Last Month"
          delay={0.3}
        />
        <StatCard
          label="Active Classes"
          value="4"
          icon={Users}
          trend="Current Load"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard
          delay={0.5}
          className="lg:col-span-2 min-h-[350px] flex flex-col"
        >
          <h3 className="text-lg font-semibold text-white mb-6">
            Engagement Overview
          </h3>
          <div className="flex-1 flex items-center justify-center border border-white/5 rounded-xl bg-white/[0.01]">
            <p className="text-neutral-500 text-sm">
              [ Charting Component Area ]
            </p>
          </div>
        </GlassCard>

        <GlassCard delay={0.6} className="flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">
              Recent Activity
            </h3>
            <button className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
              View All
            </button>
          </div>
          <div className="space-y-4 flex-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="group p-3 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all cursor-pointer flex gap-3 items-start"
              >
                <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                <div>
                  <p className="text-sm text-neutral-200 font-medium group-hover:text-white transition-colors">
                    Midterm Exam Schedule
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    CS101 • Sent 2 hours ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

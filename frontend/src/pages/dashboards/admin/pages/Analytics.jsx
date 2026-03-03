import { motion } from "framer-motion";
import { TrendingUp, Users, Target, Bell, Search } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import AdminSidebar from "../components/AdminSidebar";

const engagementData = [
  { name: "Mon", engagement: 4000 },
  { name: "Tue", engagement: 3000 },
  { name: "Wed", engagement: 5000 },
  { name: "Thu", engagement: 2780 },
  { name: "Fri", engagement: 6890 },
  { name: "Sat", engagement: 2390 },
  { name: "Sun", engagement: 3490 },
];

const trendingTags = [
  { tag: "#Cybersecurity", growth: "+45%", width: "85%" },
  { tag: "#MachineLearning", growth: "+30%", width: "65%" },
  { tag: "#CareerDevelopment", growth: "+12%", width: "40%" },
];

export default function Analytics() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      <AdminSidebar />

      <main className="flex-1 flex flex-col min-h-screen">
        
       

        <div className="p-8 space-y-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">
              Engagement Insights
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              Real-time behavior tracking across the university network.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Engagement Graph (2 columns wide) */}
            <div className="lg:col-span-2 bg-[#0D0D0D] border border-white/5 rounded-[10px] p-8 shadow-2xl relative overflow-hidden h-[450px]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-bold tracking-tight">
                  System Engagement
                </h3>
                <div className="flex bg-[#161616] rounded-[10px] p-1 text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">
                  <span className="px-3 py-1.5 bg-[#252525] text-white rounded-[10px]">
                    Live
                  </span>
                  <span className="px-3 py-1.5 hover:text-neutral-300 cursor-pointer">
                    Archive
                  </span>
                </div>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={engagementData}>
                    <defs>
                      <linearGradient
                        id="colorEngage"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#ffffff05"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#666", fontSize: 10, fontWeight: "bold" }}
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{
                        stroke: "#3b82f6",
                        strokeWidth: 1,
                        strokeDasharray: "5 5",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="engagement"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorEngage)"
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trending Interests Column */}
            <div className="space-y-4">
              <div className="bg-[#0D0D0D] p-8 rounded-[10px] border border-white/5 shadow-2xl h-full">
                <div className="flex items-center gap-3 mb-8 text-blue-500">
                  <TrendingUp size={20} />
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Interests
                  </h3>
                </div>
                <div className="space-y-8">
                  {trendingTags.map((item) => (
                    <div key={item.tag} className="space-y-3">
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                        <span className="text-neutral-400">{item.tag}</span>
                        <span className="text-green-500">{item.growth}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-[10px] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: item.width }}
                          transition={{ duration: 1.5, ease: "circOut" }}
                          className="h-full bg-blue-600 rounded-[10px] shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
              icon={<Target className="text-blue-500" size={28} />}
              title="Notification Accuracy"
              value="92.4%"
              bg="bg-blue-600/10"
            />
            <StatCard
              icon={<Users className="text-green-500" size={28} />}
              title="Active Students"
              value="12,402"
              bg="bg-green-600/10"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

// 3. Custom Hover Tooltip mirroring high-end dashboard style
function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111] border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">
          {payload[0].payload.name}
        </p>
        <p className="text-xl font-bold text-blue-500">
          {payload[0].value.toLocaleString()}{" "}
          <span className="text-[10px] text-neutral-400">clicks</span>
        </p>
      </div>
    );
  }
  return null;
}

function StatCard({ icon, title, value, bg }) {
  return (
    <div className="bg-[#0D0D0D] p-8 rounded-[10px] border border-white/5 flex items-center gap-6 shadow-xl hover:bg-[#111] transition-all group">
      <div
        className={`w-16 h-16 ${bg} rounded-[10px] flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
      <div>
        <h4 className="text-neutral-500 text-[11px] font-black uppercase tracking-widest">
          {title}
        </h4>
        <p className="text-4xl font-black tracking-tighter mt-1">{value}</p>
      </div>
    </div>
  );
}

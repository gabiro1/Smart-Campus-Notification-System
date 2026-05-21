import { useQuery } from "@tanstack/react-query";
import { GlassCard } from "@/components/shared";
import {
  Building2,
  Send,
  Loader2,
} from "lucide-react";
import principalService from "../../../../services/principalService";

export default function PrincipalDepartments() {
  const { data, isLoading } = useQuery({
    queryKey: ["principal", "departments"],
    queryFn: () => principalService.getDepartmentAnalytics().then((r) => r?.data || null),
    staleTime: 300_000,
  });

  const departments = data?.departments || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const rateColor = (rate) =>
    rate >= 70 ? "text-emerald-400" : rate >= 40 ? "text-amber-400" : "text-red-400";
  const rateBg = (rate) =>
    rate >= 70 ? "bg-emerald-500" : rate >= 40 ? "bg-amber-500" : "bg-red-500";
  const sorted = [...departments].sort((a, b) => b.readRate - a.readRate);

  return (
    <div className="space-y-6 pb-8">
      <header>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Departments</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Overview of all academic departments and their notification engagement
        </p>
      </header>

      {sorted.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Building2 size={48} className="mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground">No department data available yet.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((dept) => (
            <GlassCard key={dept.id || dept.name} className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground text-base">{dept.name || "Unknown"}</h3>
                  {dept.code && (
                    <p className="text-xs text-muted-foreground mt-0.5">{dept.code}</p>
                  )}
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-sm font-bold ${rateColor(dept.readRate)} bg-accent`}>
                  {dept.readRate}%
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Read rate</span>
                    <span className="font-medium text-foreground">{dept.readRate}%</span>
                  </div>
                  <div className="h-2 bg-accent rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${rateBg(dept.readRate)}`}
                      style={{ width: `${Math.min(100, dept.readRate)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">
                    <Send size={11} className="inline mr-1" />
                    {dept.notificationsSent?.toLocaleString() || 0} sent
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {dept.readRate >= 70 ? "High engagement" : dept.readRate >= 40 ? "Moderate" : "Low"}
                  </span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

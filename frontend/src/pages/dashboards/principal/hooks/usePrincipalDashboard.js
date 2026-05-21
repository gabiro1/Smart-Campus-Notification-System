import { useCallback, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import principalService from "../../../../services/principalService";
import { useSocket } from "../../../../context/SocketContext";

export function usePrincipalOverview() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const fetchLock = useRef(false);

  const query = useQuery({
    queryKey: ["principal", "overview"],
    queryFn: async () => {
      if (fetchLock.current) return queryClient.getQueryData(["principal", "overview"]);
      fetchLock.current = true;
      try {
        const r = await principalService.getOverview();
        return r?.data || null;
      } finally {
        fetchLock.current = false;
      }
    },
    staleTime: 120_000,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (!socket) return;

    const handleApprovalCounts = (data) => {
      queryClient.setQueryData(["principal", "overview"], (old) => {
        if (!old) return old;
        return {
          ...old,
          pendingItems: {
            ...old.pendingItems,
            events: data.pendingEvents ?? old.pendingItems?.events,
            announcements: data.pendingAnnouncements ?? old.pendingItems?.announcements,
          },
        };
      });
    };

    const handleAlertNew = (data) => {
      queryClient.setQueryData(["principal", "overview"], (old) => {
        if (!old) return old;
        return {
          ...old,
          alerts: [...(old.alerts || []), data.alert],
        };
      });
    };

    const handleMetricUpdate = (data) => {
      queryClient.setQueryData(["principal", "overview"], (old) => {
        if (!old) return old;
        return {
          ...old,
          metrics: { ...old.metrics, [data.metric]: data.value },
          trends: { ...old.trends, [data.metric]: data.trend },
        };
      });
    };

    socket.on("approval:counts", handleApprovalCounts);
    socket.on("alert:new", handleAlertNew);
    socket.on("metric:update", handleMetricUpdate);

    return () => {
      socket.off("approval:counts", handleApprovalCounts);
      socket.off("alert:new", handleAlertNew);
      socket.off("metric:update", handleMetricUpdate);
    };
  }, [socket, queryClient]);

  return query;
}

export function useDepartmentAnalytics() {
  return useQuery({
    queryKey: ["principal", "departments"],
    queryFn: () => principalService.getDepartmentAnalytics().then((r) => r?.data || null),
    staleTime: 300_000,
  });
}

export function useCommunicationTrends(days = 14) {
  return useQuery({
    queryKey: ["principal", "trends", days],
    queryFn: () => principalService.getCommunicationTrends(days).then((r) => r?.data || null),
    staleTime: 3600_000,
  });
}

export function useApprovalAnalytics() {
  return useQuery({
    queryKey: ["principal", "approvals"],
    queryFn: () => principalService.getApprovalAnalytics().then((r) => r?.data || null),
    staleTime: 3600_000,
  });
}

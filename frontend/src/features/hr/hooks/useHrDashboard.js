import { useQuery, useQueryClient } from "@tanstack/react-query";
import hrService from "../../../services/hrService";
import { HR_STATUS } from "../constants/hrStatus";

const HR_KEYS = {
  all: ["hr"],
  overview: () => [...HR_KEYS.all, "overview"],
  drafts: (status) => [...HR_KEYS.all, "drafts", status ?? "all"],
  assignments: (status) => [...HR_KEYS.all, "assignments", status ?? "all"],
  myAssignments: () => [...HR_KEYS.all, "my-assignments"],
};

const DEFAULT_STALE = 60_000;

export function useHrOverview() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: HR_KEYS.overview(),
    queryFn: async () => {
      const r = await hrService.getOverview();
      return r?.data || null;
    },
    staleTime: 120_000,
    refetchInterval: 30_000,
    placeholderData: () => queryClient.getQueryData(HR_KEYS.overview()),
  });
}

export function useStaffDrafts(status) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: HR_KEYS.drafts(status),
    queryFn: () => hrService.getStaffDrafts(status).then((r) => r?.data || []),
    staleTime: DEFAULT_STALE,
    placeholderData: () => {
      const all = queryClient.getQueryData(HR_KEYS.drafts());
      if (!all || !status) return undefined;
      return all.filter((d) => d.status === status);
    },
  });
}

export function useHrAssignments(status) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: HR_KEYS.assignments(status),
    queryFn: () => hrService.getAllRoleAssignments(status).then((r) => r?.data || []),
    staleTime: DEFAULT_STALE,
    placeholderData: () => {
      const all = queryClient.getQueryData(HR_KEYS.assignments());
      if (!all || !status) return undefined;
      return all.filter((a) => a.status === status);
    },
  });
}

export function useMyAssignments() {
  return useQuery({
    queryKey: HR_KEYS.myAssignments(),
    queryFn: () => hrService.getMyRoleAssignments().then((r) => r?.data || []),
    staleTime: DEFAULT_STALE,
  });
}

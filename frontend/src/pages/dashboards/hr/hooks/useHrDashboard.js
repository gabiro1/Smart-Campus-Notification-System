import { useQuery } from "@tanstack/react-query";
import hrService from "../../../../services/hrService";

export function useHrOverview() {
  return useQuery({
    queryKey: ["hr", "overview"],
    queryFn: () => hrService.getOverview().then((r) => r?.data || null),
    staleTime: 120_000,
    refetchInterval: 30_000,
  });
}

export function useStaffDrafts(status) {
  return useQuery({
    queryKey: ["hr", "drafts", status],
    queryFn: () => hrService.getStaffDrafts(status).then((r) => r?.data || []),
    staleTime: 60_000,
  });
}

export function useHrAssignments(status) {
  return useQuery({
    queryKey: ["hr", "assignments", status],
    queryFn: () => hrService.getAllRoleAssignments(status).then((r) => r?.data || []),
    staleTime: 60_000,
  });
}

export function useMyAssignments() {
  return useQuery({
    queryKey: ["hr", "my-assignments"],
    queryFn: () => hrService.getMyRoleAssignments().then((r) => r?.data || []),
    staleTime: 60_000,
  });
}

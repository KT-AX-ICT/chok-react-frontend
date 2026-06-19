import { apiClient, readData, USE_MOCKS } from "./client";
import type { DashboardSummary } from "../domain/analyses/types";
import { mockDashboard } from "../mocks/analyses";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  if (USE_MOCKS) return readData(mockDashboard);
  const { data } = await apiClient.get<DashboardSummary>("/api/dashboard/summary");
  return data;
}

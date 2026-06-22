import { apiClient, readData, USE_MOCKS } from "./client";
import type { DashboardResponse } from "../domain/dashboard/types";
import { mockDashboardResponse } from "../mocks/dashboard";

export interface DashboardQuery {
  // 모두 선택값. startAt/endAt 미지정 시 서버가 최근 24시간을 사용한다. interval 기본값 1h.
  startAt?: string;
  endAt?: string;
  interval?: string;
}

export async function getDashboard(query: DashboardQuery = {}): Promise<DashboardResponse> {
  if (USE_MOCKS) return readData(mockDashboardResponse);
  const { data } = await apiClient.get<DashboardResponse>("/api/v1/dashboard/summary", {
    params: query,
  });
  return data;
}

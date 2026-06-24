import { apiClient, readData, USE_MOCKS } from "./client";
import type { DashboardResponse } from "../domain/dashboard/types";
import { mockDashboardResponse, emptyDashboardResponse } from "../mocks/dashboard";

// 빈 상태 UI 테스트용 토글. mock 사용 시 true면 빈 응답을 반환한다.
const MOCK_EMPTY = import.meta.env.VITE_MOCK_EMPTY === "true";

export interface DashboardQuery {
  // 모두 선택값. startAt/endAt 미지정 시 클라이언트가 현재 시각 기준 최근 24시간을 채운다. interval 기본값 1h.
  startAt?: string;
  endAt?: string;
  interval?: string;
}

// Date → 로컬 ISO LocalDateTime("YYYY-MM-DDTHH:mm:ss", 타임존/밀리초 없음 — 백엔드 LocalDateTime 형식).
function toLocalIso(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export async function getDashboard(query: DashboardQuery = {}): Promise<DashboardResponse> {
  if (USE_MOCKS) return readData(MOCK_EMPTY ? emptyDashboardResponse : mockDashboardResponse);

  // startAt/endAt 미지정 시 현재 시각 기준 최근 24시간을 명시 전송한다.
  // (백엔드 기본값에 맡기면 전체가 집계되어 사이드바 cautionCount·대시보드 통계가 24h가 아니게 됨)
  const now = new Date();
  const params = {
    startAt: query.startAt ?? toLocalIso(new Date(now.getTime() - 24 * 60 * 60 * 1000)),
    endAt: query.endAt ?? toLocalIso(now),
    ...(query.interval ? { interval: query.interval } : {}),
  };

  const { data } = await apiClient.get<DashboardResponse>("/api/v1/dashboard/summary", { params });
  return data;
}

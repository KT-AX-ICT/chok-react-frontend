// Spring `DashboardResponse` mock 응답과 동일한 shape.
// VITE_USE_MOCKS=true일 때 사용하며, 실제 /api/v1/dashboard/summary 응답으로 교체해도
// 화면 코드 변경이 없도록 Spring DashboardService mock 값과 형태를 맞춘다.
import type { DashboardResponse, TimeSeriesItem } from "../domain/dashboard/types";

const END_AT = "2026-06-22T21:00:00";
const START_AT = "2026-06-21T21:00:00";

// Spring mockTimeSeries: startAt부터 1h 간격, total=480+i*15, caution=9+i
function buildTimeSeries(): TimeSeriesItem[] {
  const items: TimeSeriesItem[] = [];
  for (let i = 0; i < 24; i += 1) {
    const hour = (21 + i) % 24;
    const dayOffset = 21 + i >= 24 ? 22 : 21;
    const time = `2026-06-${dayOffset}T${String(hour).padStart(2, "0")}:00:00`;
    items.push({ time, totalCount: 480 + i * 15, cautionCount: 9 + i });
  }
  return items;
}

export const mockDashboardResponse: DashboardResponse = {
  range: { startAt: START_AT, endAt: END_AT },
  stats: { totalLogCount: 15_234, cautionLogCount: 312, analyzedLogCount: 9_000 },
  timeSeries: buildTimeSeries(),
  riskDistribution: [
    { riskLevel: "긴급", count: 100 },
    { riskLevel: "높음", count: 400 },
    { riskLevel: "보통", count: 1_100 },
    { riskLevel: "낮음", count: 7_400 },
  ],
  typeDistribution: [
    { logType: "RAS", count: 4_200 },
    { logType: "KERNEL", count: 1_180 },
  ],
  componentDistribution: [
    { component: "KERNEL", count: 8_800 },
    { component: "APP", count: 3_100 },
    { component: "MMCS", count: 1_900 },
    { component: "DISCOVERY", count: 1_434 },
  ],
  levelDistribution: [
    { logLevel: "INFO", count: 14_000 },
    { logLevel: "WARNING", count: 780 },
    { logLevel: "ERROR", count: 312 },
    { logLevel: "FATAL", count: 120 },
    { logLevel: "SEVERE", count: 18 },
    { logLevel: "FAILURE", count: 6 },
  ],
  recentCautionLogs: [
    {
      logId: 2,
      occurredAt: "2026-06-22T20:14:32",
      node: "R04-M1-N",
      component: "KERNEL",
      logLevel: "FATAL",
      isCaution: true,
      isAnalysis: true,
      content: "ciod: failed to read message prefix on control stream",
    },
    {
      logId: 4,
      occurredAt: "2026-06-22T19:45:11",
      node: "R07-M0-N",
      component: "KERNEL",
      logLevel: "FATAL",
      isCaution: true,
      isAnalysis: true,
      content: "machine check interrupt: CPU thermal throttling detected",
    },
    {
      logId: 6,
      occurredAt: "2026-06-22T18:55:01",
      node: "R13-M0-N",
      component: "APP",
      logLevel: "ERROR",
      isCaution: true,
      isAnalysis: false,
      content: "OOM killer terminated process with oom_score 998",
    },
    {
      logId: 9,
      occurredAt: "2026-06-22T18:02:58",
      node: "R15-M3-N",
      component: "DISCOVERY",
      logLevel: "WARNING",
      isCaution: true,
      isAnalysis: false,
      content: "eth0 link down after 3 retries",
    },
  ],
  recentPatterns: [
    { patternId: 12, patternName: "Data TLB Error", count: 87, importance: 90 },
    { patternId: 13, patternName: "Application Read Error", count: 42, importance: 72 },
  ],
};

// 빈 상태 UI 확인용. range만 유지하고 통계 0 / 분포·리스트는 빈 배열.
// VITE_USE_MOCKS=true + VITE_MOCK_EMPTY=true 일 때 사용된다(api/dashboard.ts).
export const emptyDashboardResponse: DashboardResponse = {
  range: { startAt: START_AT, endAt: END_AT },
  stats: { totalLogCount: 0, cautionLogCount: 0, analyzedLogCount: 0 },
  timeSeries: [],
  riskDistribution: [],
  typeDistribution: [],
  componentDistribution: [],
  levelDistribution: [],
  recentCautionLogs: [],
  recentPatterns: [],
};

// Spring DashboardResponse를 화면이 쓰기 쉬운 형태로 변환한다.
// UI 표현 변경과 API DTO 변경의 경계를 여기서 분리한다.
import type { DashboardResponse, RiskLevel } from "./types";

export const RISK_ORDER: RiskLevel[] = ["긴급", "높음", "보통", "낮음"];

export const riskColor: Record<RiskLevel, string> = {
  긴급: "#ef4444",
  높음: "#f97316",
  보통: "#f59e0b",
  낮음: "#10b981",
};

export const riskToneClass: Record<RiskLevel, string> = {
  긴급: "text-danger",
  높음: "text-orange",
  보통: "text-warning",
  낮음: "text-success",
};

function isKnownRisk(level: string): level is RiskLevel {
  return (RISK_ORDER as string[]).includes(level);
}

export function riskColorOf(level: string): string {
  return isKnownRisk(level) ? riskColor[level] : "#6b7280";
}

export function riskToneClassOf(level: string): string {
  return isKnownRisk(level) ? riskToneClass[level] : "text-muted";
}

export interface ChartPoint {
  label: string;
  total: number;
  caution: number;
}

// "2026-06-18T21:00:00" -> "21" (시간 라벨). 형식이 다르면 앞 16자에서 추출 실패 시 원본 사용.
function hourLabel(time: string): string {
  const match = time.match(/T(\d{2}):/);
  if (match) return match[1];
  return time;
}

export interface DashboardViewModel {
  timeSeries: ChartPoint[];
  riskDistribution: Array<{ riskLevel: string; count: number; color: string }>;
  componentBars: Array<{ component: string; count: number }>;
}

export function toDashboardViewModel(response: DashboardResponse): DashboardViewModel {
  return {
    timeSeries: response.timeSeries.map((item) => ({
      label: hourLabel(item.time),
      total: item.totalCount,
      caution: item.cautionCount,
    })),
    riskDistribution: response.riskDistribution.map((item) => ({
      riskLevel: item.riskLevel,
      count: item.count,
      color: riskColorOf(item.riskLevel),
    })),
    componentBars: response.componentDistribution.map((item) => ({
      component: item.component,
      count: item.count,
    })),
  };
}

import type { LogLevel } from "./log/types";
import type { RiskLevel } from "./risk";

export const riskMeta: Record<RiskLevel, { label: string; tone: string; order: number }> = {
  긴급: { label: "긴급", tone: "danger", order: 1 },
  높음: { label: "높음", tone: "orange", order: 2 },
  보통: { label: "보통", tone: "warning", order: 3 },
  낮음: { label: "낮음", tone: "success", order: 4 },
};

export const levelMeta: Record<LogLevel, { label: string; tone: string }> = {
  INFO: { label: "INFO", tone: "muted" },
  WARNING: { label: "WARNING", tone: "warning" },
  ERROR: { label: "ERROR", tone: "orange" },
  FATAL: { label: "FATAL", tone: "danger" },
  SEVERE: { label: "SEVERE", tone: "danger" },
  FAILURE: { label: "FAILURE", tone: "danger" },
};

// 시스템 정상/이상 판정: FATAL 기반(1차 필터). 추후 API가 is_abnormal을 주면 그 값이 우선.
export function isAbnormalLog(log: { level: LogLevel; isAbnormal?: boolean }) {
  return log.isAbnormal ?? log.level === "FATAL";
}

// 분석 화면의 BGL 라벨(검증 답지) 표시에만 사용. 로그 목록 status 판정에는 쓰지 않음.
export function isAnomalyLabel(label: string) {
  return label !== "-";
}

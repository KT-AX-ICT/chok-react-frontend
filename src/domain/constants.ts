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

// 로그 목록 status 점의 4-state. none=점 없음(비FATAL), pending=분석 전, normal=정상, abnormal=이상.
export type LogStatus = "none" | "pending" | "normal" | "abnormal";

// 목록 status 판정: 분석 대상(FATAL)만 점을 찍는다. 분석 전(isAnalysis=false)은 회색,
// 분석 완료 후엔 isCaution이 곧 2차 판정(isAbnormal)과 일치하므로 정상/이상을 그대로 가른다.
// (안전망 FATAL 분기는 isAbnormal=null 즉 분석 전에만 작동 → isAnalysis로 이미 분리됨)
export function logStatus(log: { logLevel: LogLevel; isAnalysis: boolean; isCaution: boolean }): LogStatus {
  if (log.logLevel !== "FATAL") return "none";
  if (!log.isAnalysis) return "pending";
  return log.isCaution ? "abnormal" : "normal";
}

// 분석 화면의 BGL 라벨(검증 답지) 표시에만 사용. 로그 목록 status 판정에는 쓰지 않음.
export function isAnomalyLabel(label: string) {
  return label !== "-";
}

import type { LogLevel } from "./log/types";
import type { RiskLevel } from "./analyses/types";

export const riskMeta: Record<RiskLevel, { label: string; tone: string; order: number }> = {
  LOW: { label: "낮음", tone: "success", order: 4 },
  MEDIUM: { label: "보통", tone: "warning", order: 3 },
  HIGH: { label: "높음", tone: "orange", order: 2 },
  CRITICAL: { label: "긴급", tone: "danger", order: 1 },
};

export const levelMeta: Record<LogLevel, { label: string; tone: string }> = {
  INFO: { label: "INFO", tone: "muted" },
  WARN: { label: "WARN", tone: "warning" },
  ERROR: { label: "ERROR", tone: "danger" },
  FATAL: { label: "FATAL", tone: "danger" },
  DEBUG: { label: "DEBUG", tone: "purple" },
};

export function isAnomalyLabel(label: string) {
  return label !== "-";
}

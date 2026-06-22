import type { LogEntry } from "../log/types";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type AnalysisStatus = "COMPLETED" | "FAILED" | "RUNNING";

export interface AnalysisSummary {
  id: number;
  logId: number;
  lineNumber: number;
  label: string;
  node: string;
  timestamp: string;
  riskLevel: RiskLevel;
  status: AnalysisStatus;
  reason: string;
  patternId?: string;
}

export interface AnalysisDetail extends AnalysisSummary {
  log: LogEntry;
  contentAnalysis: string;
  responseAction: string;
  relatedPattern?: {
    id: string;
    title: string;
    description: string;
  };
}

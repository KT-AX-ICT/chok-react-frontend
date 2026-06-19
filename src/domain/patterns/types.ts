import type { RiskLevel } from "../analyses/types";

export interface PatternSummary {
  id: string;
  title: string;
  description: string;
  eventTemplate: string;
  occurrences: number;
  affectedNodes: string[];
  riskLevel: RiskLevel;
  firstSeen: string;
  lastSeen: string;
  reason: string;
}

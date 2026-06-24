// Spring `domain.dashboard.dto.DashboardResponse`와 1:1로 맞춘 타입.
// 필드명/형태는 Spring DTO를 SSOT로 따른다. 응답에 없는 값은 여기에 추가하지 않는다.

// riskLevel SSOT는 src/domain/risk.ts. 여기서는 재노출만 한다.
export type { RiskLevel } from "../risk";

export interface DashboardRange {
  startAt: string;
  endAt: string;
}

export interface DashboardStats {
  totalLogCount: number;
  cautionLogCount: number;
  analyzedLogCount: number;
}

export interface TimeSeriesItem {
  time: string;
  totalCount: number;
  cautionCount: number;
}

export interface RiskDistributionItem {
  riskLevel: string;
  count: number;
}

export interface TypeDistributionItem {
  logType: string;
  count: number;
}

export interface ComponentDistributionItem {
  component: string;
  count: number;
}

export interface LevelDistributionItem {
  logLevel: string;
  count: number;
}

export interface RecentCautionLog {
  logId: number;
  occurredAt: string;
  node: string;
  component: string;
  logLevel: string;
  isCaution: boolean;
  isAnalysis: boolean;
  content: string;
}

export interface RecentPattern {
  patternId: number;
  patternName: string;
  count: number;
  importance: number;
}

export interface DashboardResponse {
  range: DashboardRange;
  stats: DashboardStats;
  timeSeries: TimeSeriesItem[];
  riskDistribution: RiskDistributionItem[];
  typeDistribution: TypeDistributionItem[];
  componentDistribution: ComponentDistributionItem[];
  levelDistribution: LevelDistributionItem[];
  recentCautionLogs: RecentCautionLog[];
  recentPatterns: RecentPattern[];
}

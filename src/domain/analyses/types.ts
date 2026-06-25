import type { RiskLevel } from "../risk";
// RiskLevel 재노출(다른 파일이 여기서 RiskLevel을 import함) — 반드시 유지.
export type { RiskLevel };

// 분석 도메인 전용 로그 정보 타입.
// 주의: 백엔드 AnalysisDto.LogInfo 기준의 독립 타입이다.
// log 도메인(LogEntry, mockLogs)에 절대 의존하지 않는다(결합 차단).
// ※ label(BGL 답지)은 백엔드 응답에 노출되지 않으므로 포함하지 않는다.
export interface AnalysisLogInfo {
  logId: number;
  occurredAt: string;
  node: string;
  component: string;
  logType: string;
  logLevel: string;
  content: string;
  isCaution: boolean;
}

// 목록 항목 — 백엔드 AnalysisDto와 1:1.
export interface AnalysisSummary {
  analysisId: number;
  domain: string;
  riskLevel: RiskLevel | null; // 정상 판정 분석은 null.
  aiSummary: string;
  analysis: string;
  responsePlan: string[];
  log: AnalysisLogInfo;
  // 백엔드 AnalysisDto: clusterId=log_analysis.cluster_id(=pattern_view PK), patternName=그 클러스터 제목.
  // 정상·미분류 등 패턴이 없으면 둘 다 null. (응답엔 항상 키가 있고 값만 null일 수 있어 방어적으로 읽음)
  clusterId?: number | null;
  patternName?: string | null;
}

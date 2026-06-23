import type { RiskLevel } from "../risk";
// RiskLevel 재노출(다른 파일이 여기서 RiskLevel을 import함) — 반드시 유지.
export type { RiskLevel };

// 분석 도메인 전용 로그 정보 타입.
// 주의: 백엔드 AnalysisDto.LogInfo 기준의 독립 타입이다.
// log 도메인(LogEntry, mockLogs)에 절대 의존하지 않는다(결합 차단).
export interface AnalysisLogInfo {
  logId: number;
  occurredAt: string;
  node: string;
  component: string;
  logType: string;
  logLevel: string;
  label: string;
  content: string;
  isCaution: boolean;
}

// 목록 항목 — 백엔드 AnalysisDto와 1:1.
export interface AnalysisSummary {
  analysisId: number;
  domain: string;
  riskLevel: RiskLevel;
  aiSummary: string;
  analysis: string;
  responsePlan: string[];
  log: AnalysisLogInfo;
  // TODO(backend): clusterId는 엔티티(LogAnalysis)엔 있으나 AnalysisDto 응답엔 미포함.
  // 목록의 "패턴 클러스터" 컬럼 표시를 위해 추후 AnalysisDto에 노출 필요. 현재는 mock에서만 채운다.
  clusterId?: number;
}

// 상세 화면용 — 분석 엔티티(LogAnalysis) 필드 기준.
// summary=aiSummary, analysis=내용 분석, action=대응 방안(responsePlan으로 파싱),
// clusterId=패턴 클러스터(미분류=99), analyzedAt=분석 시각, log=원본 로그.
export interface AnalysisDetail {
  analysisId: number;
  domain: string;
  riskLevel: RiskLevel;
  aiSummary: string;
  analysis: string;
  responsePlan: string[];
  clusterId: number;
  analyzedAt: string;
  log: AnalysisLogInfo;
}

import type { PageResponse } from "../api/client";
import type { LogDetail, LogEntry, LogRaw } from "../domain/log/types";

// 백엔드 LogSummary(SSOT) 형태의 mock. BGL 로그 성격에 맞춘 현실적 값.
// - logLevel: 6종(INFO/WARNING/ERROR/FATAL/SEVERE/FAILURE)
// - riskLevel: 분석 완료 시 한글(긴급/높음/보통/낮음), 미분석이면 null
// - isCaution/isAnalysis: 백엔드 파생값(시스템 판정 / 분석결과 존재)을 그대로 모사
// ※ label(BGL 답지)은 백엔드 응답에 노출되지 않으므로 mock에서도 제외한다.
const mockLogs: LogEntry[] = [
  {
    logId: 1,
    occurredAt: "2026-06-03 00:00:11",
    node: "R02-M1-N",
    component: "KERNEL",
    logType: "RAS",
    logLevel: "INFO",
    isCaution: false,
    isAnalysis: false,
    content: "instruction cache parity error corrected",
    riskLevel: null,
  },
  {
    logId: 2,
    occurredAt: "2026-06-04 01:14:32",
    node: "R04-M1-N",
    component: "APP",
    logType: "RAS",
    logLevel: "FATAL",
    isCaution: true,
    isAnalysis: true,
    content: "ciod: failed to read message prefix after forking",
    riskLevel: "긴급",
  },
  {
    logId: 3,
    occurredAt: "2026-06-04 02:31:45",
    node: "R11-M2-N",
    component: "KERNEL",
    logType: "RAS",
    logLevel: "WARNING",
    isCaution: false,
    isAnalysis: false,
    content: "unauthorized access attempt on /proc/sysrq-trigger",
    riskLevel: null,
  },
  {
    logId: 4,
    occurredAt: "2026-06-04 03:45:11",
    node: "R07-M0-N",
    component: "KERNEL",
    logType: "RAS",
    logLevel: "FATAL",
    isCaution: true,
    isAnalysis: true,
    content: "machine check exception: CPU thermal throttling",
    riskLevel: "높음",
  },
  {
    logId: 5,
    occurredAt: "2026-06-04 04:02:58",
    node: "R15-M3-N",
    component: "KERNEL",
    logType: "RAS",
    logLevel: "ERROR",
    isCaution: true,
    isAnalysis: false,
    content: "network interface eth0: link down after 3 retries",
    riskLevel: null,
  },
  {
    logId: 6,
    occurredAt: "2026-06-05 07:55:01",
    node: "R13-M0-N",
    component: "APP",
    logType: "RAS",
    logLevel: "FATAL",
    isCaution: true,
    isAnalysis: true,
    content: "out of memory: kill process 9234 score 998",
    riskLevel: "보통",
  },
];

// GET /api/v1/logs 응답(PageResponse<LogSummary>) 모사. 단일 페이지 기준.
export const mockLogPage: PageResponse<LogEntry> = {
  content: mockLogs,
  page: 0,
  size: 20,
  totalElements: mockLogs.length,
  totalPages: 1,
  first: true,
  last: true,
};

// GET /api/v1/logs/{logId} 응답(LogDetail) 모사.
// 목록 mock(LogSummary)에 상세 전용 필드 + 분석/패턴(분석 완료분만)을 덧붙인다.
export function mockLogDetail(logId: number): LogDetail {
  const summary = mockLogs.find((item) => item.logId === logId);
  if (!summary) throw new Error(`Log ${logId} not found`);

  const log: LogRaw = {
    ...summary,
    isAbnormal: summary.isAnalysis ? summary.isCaution : null,
    nodeRepeat: summary.node,
    eventId: `E${100 + summary.logId}`,
  };

  // 분석 미완료(isAnalysis=false 또는 riskLevel null)면 analysis/pattern은 null(분석 없음/분석 중).
  if (!summary.isAnalysis || summary.riskLevel === null) {
    return { log, analysis: null, pattern: null };
  }

  return {
    log,
    analysis: {
      analysisId: 500 + summary.logId,
      domain: "BGL",
      riskLevel: summary.riskLevel,
      aiSummary: `${summary.component} 컴포넌트 이상 징후 요약(mock).`,
      analysis: `${summary.node}에서 "${summary.content}" 가 관측되었습니다(mock 분석).`,
      responsePlan: ["관련 노드 로그 수집", "동일 이벤트 재발 여부 모니터링", "필요 시 하드웨어/네트워크 점검"],
    },
    pattern: {
      patternId: 10 + summary.logId,
      patternName: `${summary.component} 패턴`,
      representativeLog: summary.content,
    },
  };
}

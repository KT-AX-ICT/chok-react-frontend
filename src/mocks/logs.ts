import type { PageResponse } from "../api/client";
import type { LogEntry } from "../domain/log/types";

// 백엔드 LogSummary(SSOT) 형태의 mock. BGL 로그 성격에 맞춘 현실적 값.
// - label: 정상은 '-', 이상은 BGL 라벨(APPREAD/KERNDTLB 등)
// - logLevel: 6종(INFO/WARNING/ERROR/FATAL/SEVERE/FAILURE)
// - riskLevel: 분석 완료 시 한글(긴급/높음/보통/낮음), 미분석이면 null
// - isCaution = label !== '-', isAnalysis = riskLevel != null (백엔드 파생값을 그대로 모사)
const mockLogs: LogEntry[] = [
  {
    logId: 1,
    occurredAt: "2026-06-03 00:00:11",
    node: "R02-M1-N",
    component: "KERNEL",
    logType: "RAS",
    logLevel: "INFO",
    label: "-",
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
    label: "APPREAD",
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
    label: "-",
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
    label: "KERNDTLB",
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
    label: "KERNSOCK",
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
    label: "APPOOM",
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

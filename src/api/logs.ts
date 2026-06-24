import { apiClient, readData, USE_MOCKS, type PageResponse } from "./client";
import type { LogDetail, LogEntry, LogListResponse } from "../domain/log/types";
import { mockLogDetail, mockLogPage } from "../mocks/logs";

// 백엔드 LogSummary = 프론트 LogEntry(1:1). 목록 응답은 PageResponse<LogSummary>.
type LogSummary = LogEntry;

export interface LogQuery {
  page?: number; // 0-base (Spring Pageable)
  size?: number;
  startAt?: string; // ISO LocalDateTime. 미지정 시 백엔드가 최근 24h 사용.
  endAt?: string;
  logLevel?: string; // INFO/WARNING/ERROR/FATAL/SEVERE/FAILURE
  keyword?: string; // content 부분검색
  isAbnormal?: boolean; // 서버 LogSearchCondition.isAbnormal. true=2차 이상만, 미지정=전체.
  // TODO(filter): 잔여 LogSearchCondition(riskLevel/logType/component/label/isCaution/isAnalysis)
  //   + Pageable.sort 는 화면 요구 확정 시 확장한다.
}

// PageResponse<LogSummary> → 화면용 LogListResponse 평탄화.
function toListResponse(payload: PageResponse<LogSummary>): LogListResponse {
  return {
    items: payload.content,
    total: payload.totalElements,
    page: payload.page,
    size: payload.size,
    totalPages: payload.totalPages,
  };
}

export async function listLogs(query: LogQuery = {}): Promise<LogListResponse> {
  if (USE_MOCKS) {
    return readData(toListResponse(mockLogPage));
  }

  const params: Record<string, unknown> = {};
  if (query.page !== undefined) params.page = query.page;
  if (query.size !== undefined) params.size = query.size;
  if (query.startAt) params.startAt = query.startAt;
  if (query.endAt) params.endAt = query.endAt;
  if (query.logLevel) params.logLevel = query.logLevel;
  if (query.keyword) params.keyword = query.keyword;
  if (query.isAbnormal !== undefined) params.isAbnormal = query.isAbnormal;

  const { data } = await apiClient.get<PageResponse<LogSummary>>("/api/v1/logs", { params });
  return toListResponse(data);
}

// 로그 상세(분석 상세 화면) — API 명세 §6.2: GET /api/v1/logs/{logId}.
// 응답 LogDetail = 원시 로그 + AI 분석(없으면 null) + 매핑 패턴(없으면 null).
export async function getLogDetail(logId: number): Promise<LogDetail> {
  if (USE_MOCKS) {
    return readData(mockLogDetail(logId));
  }

  const { data } = await apiClient.get<LogDetail>(`/api/v1/logs/${logId}`);
  return data;
}

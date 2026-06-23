import { apiClient, readData, USE_MOCKS, type PageResponse } from "./client";
import type { LogDetail, LogEntry, LogListResponse } from "../domain/log/types";
import { mockLogDetail, mockLogPage } from "../mocks/logs";

// 백엔드 LogSummary = 프론트 LogEntry(1:1). 목록 응답은 PageResponse<LogSummary>.
type LogSummary = LogEntry;

export interface LogQuery {
  page?: number; // 0-base (Spring Pageable)
  size?: number;
  // TODO(filter): 백엔드 LogSearchCondition 연동 시 아래 파라미터 추가.
  //   startAt, endAt, riskLevel, logType, component, logLevel, label, keyword, isCaution, isAnalysis
  //   + Pageable.sort. 현재는 page/size만 전달한다.
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
  // TODO(filter): LogSearchCondition 파라미터를 params에 병합.

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

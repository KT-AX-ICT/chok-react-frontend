import { apiClient, readData, USE_MOCKS, type PageResponse } from "./client";
import type { LogEntry, LogListResponse } from "../domain/log/types";
import { mockLogPage } from "../mocks/logs";

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

// TODO(detail-api): 백엔드 LogController에는 GET /logs(목록)만 존재하고
//   상세(GET /logs/{id}) 엔드포인트가 아직 없다. 추가되면 mock 폴백을 실제 호출로 교체.
export async function getLog(logId: number): Promise<LogEntry> {
  if (USE_MOCKS) {
    const log = mockLogPage.content.find((item) => item.logId === logId);
    if (!log) throw new Error(`Log ${logId} not found`);
    return readData(log);
  }

  // 상세 엔드포인트 미구현 — 임시로 목록에서 단건 조회.
  const { items } = await listLogs();
  const log = items.find((item) => item.logId === logId);
  if (!log) throw new Error(`Log ${logId} not found`);
  return log;
}

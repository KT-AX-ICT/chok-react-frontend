import { apiClient, readData, USE_MOCKS, type PageResponse } from "./client";
import type { AnalysisSummary } from "../domain/analyses/types";
import { mockAnalyses } from "../mocks/analyses";

// 백엔드 AnalysisDto = 프론트 AnalysisSummary(1:1). 목록 응답은 PageResponse<AnalysisDto>.
type AnalysisDto = AnalysisSummary;

export interface AnalysisQuery {
  page?: number; // 0-base (Spring Pageable)
  size?: number;
  startAt?: string; // ISO LocalDateTime. log.occurredAt 반열린 구간 [startAt, endAt).
  endAt?: string;
  riskLevel?: string; // 한글 정확일치(긴급/높음/보통/낮음). 백엔드 AnalysisSearchCondition.
  keyword?: string; // 서버검색: summary·analysis·action LIKE.
}

export interface AnalysisListResponse {
  items: AnalysisSummary[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

// PageResponse<AnalysisDto> → 화면용 AnalysisListResponse 평탄화.
function toListResponse(payload: PageResponse<AnalysisDto>): AnalysisListResponse {
  return {
    items: payload.content,
    total: payload.totalElements,
    page: payload.page,
    size: payload.size,
    totalPages: payload.totalPages,
  };
}

export async function listAnalyses(query: AnalysisQuery = {}): Promise<AnalysisListResponse> {
  if (USE_MOCKS) {
    // 백엔드 keyword(summary·analysis·action LIKE) 모사 — aiSummary·analysis·responsePlan 부분검색.
    const kw = query.keyword?.trim().toLowerCase();
    const items = kw
      ? mockAnalyses.filter((a) =>
          [a.aiSummary, a.analysis, ...a.responsePlan].some((v) => v.toLowerCase().includes(kw)),
        )
      : mockAnalyses;
    return readData<AnalysisListResponse>({
      items,
      total: items.length,
      page: query.page ?? 0,
      size: query.size ?? items.length,
      totalPages: 1,
    });
  }

  const params: Record<string, unknown> = {};
  if (query.page !== undefined) params.page = query.page;
  if (query.size !== undefined) params.size = query.size;
  if (query.startAt) params.startAt = query.startAt;
  if (query.endAt) params.endAt = query.endAt;
  if (query.riskLevel) params.riskLevel = query.riskLevel;
  if (query.keyword) params.keyword = query.keyword;

  const { data } = await apiClient.get<PageResponse<AnalysisDto>>("/api/v1/analysis", { params });
  return toListResponse(data);
}

// 분석 상세는 별도 엔드포인트가 아니라 로그 상세(GET /api/v1/logs/{logId})를 사용한다(명세 §6.2).
// 화면 이동은 분석목록의 log.logId → /analyses/:logId → api/logs.getLogDetail.

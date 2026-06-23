import { apiClient, readData, USE_MOCKS, type PageResponse } from "./client";
import type { AnalysisSummary } from "../domain/analyses/types";
import { mockAnalyses } from "../mocks/analyses";

// 백엔드 AnalysisDto = 프론트 AnalysisSummary(1:1). 목록 응답은 PageResponse<AnalysisDto>.
type AnalysisDto = AnalysisSummary;

export interface AnalysisQuery {
  page?: number; // 0-base (Spring Pageable)
  size?: number;
  // TODO(filter): 백엔드 GET /api/v1/analysis는 Pageable만 받고
  //   riskLevel/keyword 필터 파라미터가 없다. 서버 필터 미지원이므로
  //   위험도/검색 필터는 화면(클라이언트) 측에서 처리한다.
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
    return readData<AnalysisListResponse>({
      items: mockAnalyses,
      total: mockAnalyses.length,
      page: query.page ?? 0,
      size: query.size ?? mockAnalyses.length,
      totalPages: 1,
    });
  }

  const params: Record<string, unknown> = {};
  if (query.page !== undefined) params.page = query.page;
  if (query.size !== undefined) params.size = query.size;
  // TODO(filter): 백엔드에 위험도/키워드 필터가 생기면 params에 병합.

  const { data } = await apiClient.get<PageResponse<AnalysisDto>>("/api/v1/analysis", { params });
  return toListResponse(data);
}

// 분석 상세는 별도 엔드포인트가 아니라 로그 상세(GET /api/v1/logs/{logId})를 사용한다(명세 §6.2).
// 화면 이동은 분석목록의 log.logId → /analyses/:logId → api/logs.getLogDetail.

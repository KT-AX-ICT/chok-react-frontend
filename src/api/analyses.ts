import { apiClient, readData, USE_MOCKS, type PageResponse } from "./client";
import type { AnalysisDetail, AnalysisSummary } from "../domain/analyses/types";
import { mockAnalyses, mockAnalysisDetails } from "../mocks/analyses";

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

// TODO(detail-api): 백엔드에 분석 상세(GET /api/v1/analysis/{id}) 엔드포인트가 아직 없다(보류).
//   추가되면 아래 mock 폴백을 실제 호출로 교체한다.
//   현재는 USE_MOCKS와 무관하게 항상 mock을 반환한다(detail API 부재).
export async function getAnalysisDetail(analysisId: number): Promise<AnalysisDetail> {
  const analysis = mockAnalysisDetails.find((item) => item.analysisId === analysisId);
  if (!analysis) throw new Error(`Analysis ${analysisId} not found`);
  return readData(analysis);
}

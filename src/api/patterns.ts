import { apiClient, readData, USE_MOCKS, type PageResponse } from "./client";
import type { PatternSummary } from "../domain/patterns/types";
import { mockPatterns } from "../mocks/patterns";

// 패턴 목록 — API 명세 §8.1: GET /api/v1/log-patterns (기본 정렬 importance,desc).
// 응답은 PageResponse<PatternSummary>. 화면은 content 배열만 사용한다.
export async function listPatterns(): Promise<PatternSummary[]> {
  if (USE_MOCKS) return readData(mockPatterns);

  const { data } = await apiClient.get<PageResponse<PatternSummary>>("/api/v1/log-patterns");
  return data.content;
  // TODO(filter): riskLevel/sort/page/size 파라미터는 화면 요구 확정 시 params로 연결.
}

import { readData } from "./client";
import type { PatternView } from "../domain/patterns/types";
import { mockPatterns } from "../mocks/patterns";

// TODO(backend): pattern 조회 API 컨트롤러가 아직 없다(스펙상 추후 GET /api/v1/log-patterns 예정).
//   - 연결 시 PageResponse<PatternView> 래퍼 여부(페이지네이션) 확인 필요.
//   - occurrences/affectedNodes/riskLevel/firstSeen/lastSeen/reason 등 파생 필드는
//     pattern_view entity에 없으므로 별도 집계/분석 API에서 받아 병합해야 한다.
// 현재는 API 보류 → 항상 mock 반환.
export async function listPatterns(): Promise<PatternView[]> {
  return readData(mockPatterns);

  // 추후 연결 예시(주석):
  // const { data } = await apiClient.get<PageResponse<PatternView>>("/api/v1/log-patterns");
  // return data.content;
}

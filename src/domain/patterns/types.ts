// 위험도 SSOT는 ../risk(한글 RiskLevel). analyses/types 경유 import 금지(결합 차단).
import type { RiskLevel } from "../risk";

// 백엔드 `PatternView` entity(=pattern_view 테이블, SSOT)와 1:1 매핑되는 핵심 필드.
// - id: cluster 번호(Python이 부여, 0·99 포함, 자동채번 아님, 99=미분류). 숫자.
// - patternName/description/eventTemplate: 패턴 텍스트 정보.
// - importance: 정렬용 중요도(Integer).
// - createdAt: 생성 시각.
export interface PatternView {
  id: number;
  patternName: string;
  description: string;
  eventTemplate: string;
  importance: number;
  createdAt: string;

  // ── 아래는 PatternView entity에 없는 파생/집계 필드 ──
  // 백엔드 미제공. 추후 별도 집계/분석 API(예: 발생 집계)에서 derive 필요.
  // 현재는 데모용 mock 값으로만 채우며 화면 표현에만 사용한다.
  occurrences?: number; // 발생 횟수(집계 derive)
  affectedNodes?: string[]; // 영향 노드 목록(집계 derive)
  riskLevel?: RiskLevel; // 위험도(분석 derive, 한글)
  firstSeen?: string; // 첫 발생 시각(집계 derive)
  lastSeen?: string; // 최근 발생 시각(집계 derive)
  reason?: string; // 위험 판단 사유(분석 derive)
}

// 위험도 SSOT는 ../risk(한글 RiskLevel). analyses/types 경유 import 금지(결합 차단).
import type { RiskLevel } from "../risk";

// 패턴 목록(GET /api/v1/log-patterns) 응답 항목 — API 명세 §8/§9 PatternSummary.
// pattern_cluster 기반 + 집계 파생(count, riskLevel).
export interface PatternSummary {
  patternId: number;
  patternName: string; // pattern_cluster.pattern_name (구 title)
  description: string;
  representativeLog: string; // 대표 이벤트 템플릿(event_template)
  importance: number; // 중요도(정렬용)
  count: number; // 파생: cluster_id 매핑 log_analysis 행 수(집계)
  riskLevel: RiskLevel | null; // 파생: 소속 분석 최고 위험도(없으면 null)
}

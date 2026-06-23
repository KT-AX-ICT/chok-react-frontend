import type { PatternSummary } from "../domain/patterns/types";

// GET /api/v1/log-patterns 응답(PatternSummary) 모사 — API 명세 §8 형태.
// - patternId: 클러스터 식별자
// - representativeLog: 대표 이벤트 템플릿(event_template)
// - count: cluster_id 매핑 분석 행 수(집계 파생)
// - riskLevel: 소속 분석 최고 위험도(집계 파생, 없으면 null)
export const mockPatterns: PatternSummary[] = [
  {
    patternId: 1,
    patternName: "보안 위협 집중 발생",
    description: "무단 접근, 권한 상승, root 인증 실패가 근접 시간대에 함께 발생했습니다.",
    representativeLog: "unauthorized access attempt on <*>",
    importance: 90,
    count: 14,
    riskLevel: "긴급",
  },
  {
    patternId: 2,
    patternName: "하드웨어 장애 예고",
    description: "CE 오류가 누적된 노드에서 머신 체크 예외로 에스컬레이션되는 패턴입니다.",
    representativeLog: "machine check exception: CPU <*>",
    importance: 70,
    count: 5,
    riskLevel: "높음",
  },
  {
    patternId: 3,
    patternName: "프로세스 통신 장애",
    description: "ciod IPC 오류와 OOM 이벤트가 야간 배치 시간대에 반복됩니다.",
    representativeLog: "ciod: failed to read message prefix after forking",
    importance: 65,
    count: 23,
    riskLevel: "높음",
  },
  {
    patternId: 4,
    patternName: "네트워크 링크 실패",
    description: "네트워크 인터페이스가 반복 재시도 후 링크 다운 상태에 진입합니다.",
    representativeLog: "network interface <*>: link down after <*> retries",
    importance: 60,
    count: 8,
    riskLevel: "보통",
  },
];

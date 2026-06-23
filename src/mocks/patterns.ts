import type { PatternView } from "../domain/patterns/types";

// PatternView entity 기반 mock.
// - id/patternName/description/eventTemplate/importance/createdAt: entity 실제 필드.
//   id는 cluster 번호(숫자), importance는 정렬용 중요도(클수록 상위).
// - occurrences/affectedNodes/riskLevel/firstSeen/lastSeen/reason: entity에 없는
//   파생·집계 필드. 백엔드 미제공이라 아래 값은 화면 데모용 가짜 값이다(추후 집계 API로 대체).
export const mockPatterns: PatternView[] = [
  {
    id: 1,
    patternName: "보안 위협 집중 발생",
    description: "무단 접근, 권한 상승, root 인증 실패가 근접 시간대에 함께 발생했습니다.",
    eventTemplate: "unauthorized access attempt on <*>",
    importance: 90,
    createdAt: "2026-06-05 01:05:33",
    // 파생(데모용)
    occurrences: 14,
    affectedNodes: ["R11-M2-N", "R22-M1-N", "R03-M2-N"],
    riskLevel: "긴급",
    firstSeen: "2026-06-04 02:31:45",
    lastSeen: "2026-06-05 01:05:33",
    reason: "서로 다른 보안 이벤트가 시간적으로 연계되어 있어 단순 오설정보다 침투 시도 가능성을 우선 점검해야 합니다.",
  },
  {
    id: 2,
    patternName: "하드웨어 장애 예고",
    description: "CE 오류가 누적된 노드에서 머신 체크 예외로 에스컬레이션되는 패턴입니다.",
    eventTemplate: "machine check exception: CPU <*>",
    importance: 70,
    createdAt: "2026-06-05 07:55:01",
    // 파생(데모용)
    occurrences: 5,
    affectedNodes: ["R16-M1-N", "R05-M2-N", "R07-M0-N"],
    riskLevel: "높음",
    firstSeen: "2026-06-03 00:00:25",
    lastSeen: "2026-06-05 07:55:01",
    reason: "정정 가능 오류가 누적된 이후 치명적 하드웨어 오류로 이어질 수 있어 예방 점검 대상입니다.",
  },
  {
    id: 3,
    patternName: "프로세스 통신 장애",
    description: "ciod IPC 오류와 OOM 이벤트가 야간 배치 시간대에 반복됩니다.",
    eventTemplate: "ciod: failed to read message prefix after forking",
    importance: 65,
    createdAt: "2026-06-05 07:55:01",
    // 파생(데모용)
    occurrences: 23,
    affectedNodes: ["R04-M1-N", "R13-M0-N"],
    riskLevel: "높음",
    firstSeen: "2026-06-04 01:14:32",
    lastSeen: "2026-06-05 07:55:01",
    reason: "야간 배치 워크로드가 메모리와 IPC 자원을 과도하게 사용하는 흐름으로 볼 수 있습니다.",
  },
  {
    id: 4,
    patternName: "네트워크 링크 실패",
    description: "네트워크 인터페이스가 반복 재시도 후 링크 다운 상태에 진입합니다.",
    eventTemplate: "network interface <*>: link down after <*> retries",
    importance: 60,
    createdAt: "2026-06-05 14:22:11",
    // 파생(데모용)
    occurrences: 8,
    affectedNodes: ["R15-M3-N"],
    riskLevel: "높음",
    firstSeen: "2026-06-04 04:02:58",
    lastSeen: "2026-06-05 14:22:11",
    reason: "클러스터 통신 참여 노드에서 발생하면 작업 처리량과 장애 복구 흐름에 직접 영향을 줄 수 있습니다.",
  },
];

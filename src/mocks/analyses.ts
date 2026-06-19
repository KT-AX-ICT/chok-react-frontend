import type { AnalysisDetail, AnalysisSummary, DashboardSummary } from "../domain/analyses/types";
import { mockLogs } from "./logs";

export const mockAnalysisDetails: AnalysisDetail[] = [
  {
    id: 101,
    logId: 2,
    lineNumber: 9,
    label: "APPREAD",
    node: "R04-M1-N",
    timestamp: "2026-06-04 01:14:32",
    riskLevel: "HIGH",
    status: "COMPLETED",
    reason: "BGL 라벨이 APPREAD로 표시된 이상 로그이며, FATAL 레벨의 ciod IPC 실패가 포함되어 있습니다.",
    contentAnalysis:
      "ciod 프로세스가 fork 이후 메시지 프리픽스 읽기에 실패했습니다. 프로세스 간 통신 채널이 비정상 종료되었거나 소켓 연결이 끊긴 상황으로 볼 수 있습니다.",
    responseAction:
      "1. R04-M1-N 노드의 ciod 로그를 수집합니다.\n2. 동일 이벤트가 반복되면 해당 노드의 메모리와 네트워크 스택을 점검합니다.\n3. 실행 중이던 배치 잡 ID를 확인해 재제출 여부를 결정합니다.",
    patternId: "P-CIOD",
    relatedPattern: {
      id: "P-CIOD",
      title: "프로세스 통신 장애",
      description: "ciod IPC 오류와 OOM 이벤트가 야간 배치 시간대에 반복되는 패턴입니다.",
    },
    log: mockLogs[1],
  },
  {
    id: 102,
    logId: 3,
    lineNumber: 10,
    label: "SECURITY",
    node: "R11-M2-N",
    timestamp: "2026-06-04 02:31:45",
    riskLevel: "CRITICAL",
    status: "COMPLETED",
    reason: "BGL 라벨이 SECURITY로 표시된 이상 로그이며, 커널 제어 파일에 대한 무단 접근 시도가 기록되었습니다.",
    contentAnalysis:
      "/proc/sysrq-trigger는 커널 수준 명령을 직접 실행할 수 있는 경로입니다. 무단 접근이 성공하면 강제 재부팅이나 파일 시스템 동기화 등 시스템 전체에 영향을 줄 수 있습니다.",
    responseAction:
      "1. 보안팀에 즉시 에스컬레이션합니다.\n2. R11-M2-N 접근 계정과 세션을 감사합니다.\n3. auditd 로그를 수집해 접근 주체를 특정합니다.",
    patternId: "P-SECURITY",
    relatedPattern: {
      id: "P-SECURITY",
      title: "보안 위협 집중 발생",
      description: "무단 접근, 권한 상승, 인증 실패가 근접 시간대에 함께 발생합니다.",
    },
    log: mockLogs[2],
  },
  {
    id: 103,
    logId: 4,
    lineNumber: 11,
    label: "CRITICAL",
    node: "R07-M0-N",
    timestamp: "2026-06-04 03:45:11",
    riskLevel: "CRITICAL",
    status: "COMPLETED",
    reason: "BGL 라벨이 CRITICAL로 표시된 이상 로그이며, 머신 체크 예외와 CPU 열 쓰로틀링이 함께 기록되었습니다.",
    contentAnalysis:
      "CPU 열 쓰로틀링으로 인한 머신 체크 예외는 냉각 시스템 이상 또는 CPU 과부하 가능성을 나타냅니다. 방치하면 노드 장애나 데이터 손상으로 이어질 수 있습니다.",
    responseAction:
      "1. 하드웨어팀에 노드 점검을 요청합니다.\n2. IPMI/BMC에서 CPU 온도를 확인합니다.\n3. 해당 노드의 워크로드를 다른 노드로 이동합니다.",
    patternId: "P-HARDWARE",
    relatedPattern: {
      id: "P-HARDWARE",
      title: "하드웨어 장애 예고",
      description: "정정 가능 오류가 누적된 뒤 MCE로 에스컬레이션되는 패턴입니다.",
    },
    log: mockLogs[3],
  },
  {
    id: 104,
    logId: 5,
    lineNumber: 12,
    label: "NETWORK",
    node: "R15-M3-N",
    timestamp: "2026-06-04 04:02:58",
    riskLevel: "HIGH",
    status: "COMPLETED",
    reason: "BGL 라벨이 NETWORK로 표시된 이상 로그이며, eth0 링크 다운이 재시도 후에도 복구되지 않았습니다.",
    contentAnalysis:
      "네트워크 인터페이스 eth0가 3회 재시도 후 링크 다운 상태에 진입했습니다. 케이블, 스위치 포트, NIC 드라이버 문제 가능성이 있습니다.",
    responseAction:
      "1. 물리 케이블과 스위치 포트를 점검합니다.\n2. ethtool로 NIC 상태를 확인합니다.\n3. 백업 네트워크 경로를 활성화합니다.",
    patternId: "P-NETWORK",
    relatedPattern: {
      id: "P-NETWORK",
      title: "네트워크 링크 실패",
      description: "재시도 초과 이후 네트워크 인터페이스 링크 다운이 발생하는 패턴입니다.",
    },
    log: mockLogs[4],
  },
  {
    id: 105,
    logId: 6,
    lineNumber: 18,
    label: "CRITICAL",
    node: "R13-M0-N",
    timestamp: "2026-06-05 07:55:01",
    riskLevel: "HIGH",
    status: "COMPLETED",
    reason: "BGL 라벨이 CRITICAL로 표시된 이상 로그이며, OOM killer가 프로세스를 강제 종료했습니다.",
    contentAnalysis:
      "OOM score 998은 메모리 압박이 매우 컸음을 의미합니다. 직전 애플리케이션의 메모리 누수나 과도한 할당이 있었을 가능성이 높습니다.",
    responseAction:
      "1. 종료된 프로세스의 담당 애플리케이션을 확인합니다.\n2. OOM 직전 메모리 사용 추이를 분석합니다.\n3. cgroup 메모리 상한이나 워크로드 재분산을 검토합니다.",
    patternId: "P-CIOD",
    log: mockLogs[5],
  },
];

export const mockAnalyses: AnalysisSummary[] = mockAnalysisDetails.map((detail) => ({
  id: detail.id,
  logId: detail.logId,
  lineNumber: detail.lineNumber,
  label: detail.label,
  node: detail.node,
  timestamp: detail.timestamp,
  riskLevel: detail.riskLevel,
  status: detail.status,
  reason: detail.reason,
  patternId: detail.patternId,
}));

export const mockDashboard: DashboardSummary = {
  totalLogs: 1284,
  anomalyLogs: 7,
  analyzedAnomalies: mockAnalyses.length,
  patternCount: 4,
  latestAnalysisAt: "2026-06-05 07:55:01",
  recentAnalyses: mockAnalyses.slice(0, 4),
  hourlyCounts: [
    { hour: "00", total: 42, anomaly: 2 },
    { hour: "01", total: 38, anomaly: 3 },
    { hour: "02", total: 55, anomaly: 5 },
    { hour: "03", total: 61, anomaly: 4 },
    { hour: "04", total: 78, anomaly: 6 },
    { hour: "05", total: 83, anomaly: 7 },
    { hour: "06", total: 71, anomaly: 3 },
    { hour: "07", total: 94, anomaly: 8 },
  ],
};

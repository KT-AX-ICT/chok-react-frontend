import type { AnalysisSummary } from "../domain/analyses/types";

// 분석 목록(GET /analysis) 응답(AnalysisDto) 모사 — 백엔드와 동일 필드 세트.
// ※ label·patternId는 백엔드 AnalysisDto에 노출되지 않으므로 mock에서도 제외한다(컬럼 빈칸 유지).
export const mockAnalyses: AnalysisSummary[] = [
  {
    analysisId: 101,
    domain: "BGL",
    riskLevel: "높음",
    aiSummary:
      "ciod 프로세스가 fork 직후 IPC 메시지 프리픽스 읽기에 실패한 이상 로그입니다.",
    analysis:
      "ciod 프로세스가 fork 이후 메시지 프리픽스 읽기에 실패했습니다. 프로세스 간 통신 채널이 비정상 종료되었거나 소켓 연결이 끊긴 상황으로 볼 수 있습니다.",
    responsePlan: [
      "R04-M1-N 노드의 ciod 로그를 수집합니다.",
      "동일 이벤트가 반복되면 해당 노드의 메모리와 네트워크 스택을 점검합니다.",
      "실행 중이던 배치 잡 ID를 확인해 재제출 여부를 결정합니다.",
    ],
    log: {
      logId: 2,
      occurredAt: "2026-06-04 01:14:32",
      node: "R04-M1-N",
      component: "CIOD",
      logType: "RAS",
      logLevel: "FATAL",
      content:
        "ciod: failed to read message prefix on control stream (CioStream socket to 172.16.96.116:33934)",
      isCaution: true,
    },
  },
  {
    analysisId: 102,
    domain: "BGL",
    riskLevel: "긴급",
    aiSummary:
      "커널 제어 파일 /proc/sysrq-trigger에 대한 무단 접근 시도가 기록된 보안 이상 로그입니다.",
    analysis:
      "/proc/sysrq-trigger는 커널 수준 명령을 직접 실행할 수 있는 경로입니다. 무단 접근이 성공하면 강제 재부팅이나 파일 시스템 동기화 등 시스템 전체에 영향을 줄 수 있습니다.",
    responsePlan: [
      "보안팀에 즉시 에스컬레이션합니다.",
      "R11-M2-N 접근 계정과 세션을 감사합니다.",
      "auditd 로그를 수집해 접근 주체를 특정합니다.",
    ],
    log: {
      logId: 3,
      occurredAt: "2026-06-04 02:31:45",
      node: "R11-M2-N",
      component: "KERNEL",
      logType: "RAS",
      logLevel: "FATAL",
      content:
        "unauthorized access attempt to /proc/sysrq-trigger detected from uid=0 session",
      isCaution: true,
    },
  },
  {
    analysisId: 103,
    domain: "BGL",
    riskLevel: "긴급",
    aiSummary:
      "CPU 열 쓰로틀링과 함께 머신 체크 예외(MCE)가 발생한 하드웨어 이상 로그입니다.",
    analysis:
      "CPU 열 쓰로틀링으로 인한 머신 체크 예외는 냉각 시스템 이상 또는 CPU 과부하 가능성을 나타냅니다. 방치하면 노드 장애나 데이터 손상으로 이어질 수 있습니다.",
    responsePlan: [
      "하드웨어팀에 노드 점검을 요청합니다.",
      "IPMI/BMC에서 CPU 온도를 확인합니다.",
      "해당 노드의 워크로드를 다른 노드로 이동합니다.",
    ],
    log: {
      logId: 4,
      occurredAt: "2026-06-04 03:45:11",
      node: "R07-M0-N",
      component: "KERNEL",
      logType: "RAS",
      logLevel: "FATAL",
      content:
        "machine check: CPU thermal throttling event, core temperature exceeded threshold",
      isCaution: true,
    },
  },
  {
    analysisId: 104,
    domain: "BGL",
    riskLevel: "높음",
    aiSummary:
      "eth0 링크 다운이 3회 재시도 후에도 복구되지 않은 네트워크 이상 로그입니다.",
    analysis:
      "네트워크 인터페이스 eth0가 3회 재시도 후 링크 다운 상태에 진입했습니다. 케이블, 스위치 포트, NIC 드라이버 문제 가능성이 있습니다.",
    responsePlan: [
      "물리 케이블과 스위치 포트를 점검합니다.",
      "ethtool로 NIC 상태를 확인합니다.",
      "백업 네트워크 경로를 활성화합니다.",
    ],
    log: {
      logId: 5,
      occurredAt: "2026-06-04 04:02:58",
      node: "R15-M3-N",
      component: "MMCS",
      logType: "RAS",
      logLevel: "ERROR",
      content: "eth0: link down after 3 retries, network interface unreachable",
      isCaution: true,
    },
  },
  {
    analysisId: 105,
    domain: "BGL",
    riskLevel: "높음",
    aiSummary:
      "OOM killer가 메모리 압박으로 프로세스를 강제 종료한 이상 로그입니다.",
    analysis:
      "OOM score 998은 메모리 압박이 매우 컸음을 의미합니다. 직전 애플리케이션의 메모리 누수나 과도한 할당이 있었을 가능성이 높습니다.",
    responsePlan: [
      "종료된 프로세스의 담당 애플리케이션을 확인합니다.",
      "OOM 직전 메모리 사용 추이를 분석합니다.",
      "cgroup 메모리 상한이나 워크로드 재분산을 검토합니다.",
    ],
    log: {
      logId: 6,
      occurredAt: "2026-06-05 07:55:01",
      node: "R13-M0-N",
      component: "KERNEL",
      logType: "RAS",
      logLevel: "FATAL",
      content:
        "Out of memory: Killed process 18342 (app_worker) total-vm:8421376kB, oom_score:998",
      isCaution: true,
    },
  },
  {
    analysisId: 106,
    domain: "BGL",
    riskLevel: "보통",
    aiSummary:
      "torus 네트워크에서 정정 가능한 단일 비트 오류가 임계치 근처로 누적된 로그입니다.",
    analysis:
      "정정 가능 오류(correctable error)는 즉시 장애를 일으키지 않지만 누적되면 정정 불가 오류로 전이될 수 있습니다. 추세 감시가 필요합니다.",
    responsePlan: [
      "해당 링크의 정정 가능 오류 카운터 추이를 모니터링합니다.",
      "오류율이 계속 상승하면 케이블/커넥터 교체를 검토합니다.",
    ],
    log: {
      logId: 7,
      occurredAt: "2026-06-05 09:12:22",
      node: "R09-M1-N",
      component: "TORUS",
      logType: "RAS",
      logLevel: "WARNING",
      content:
        "correctable single bit error count approaching threshold on torus link x+",
      isCaution: false,
    },
  },
];

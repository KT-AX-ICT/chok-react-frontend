import type { LogStatus } from "../../domain/constants";

// 4-state 모두 점을 그린다. none(비FATAL=분석 대상 아님)은 회색으로 비워두지 않는다.
const statusMeta: Record<LogStatus, { tone: string; title: string }> = {
  none: { tone: "none", title: "분석 대상 아님" },
  pending: { tone: "pending", title: "분석 전" },
  normal: { tone: "success", title: "분석 결과 정상" },
  abnormal: { tone: "danger", title: "분석 결과 이상" },
};

interface StatusDotProps {
  status: LogStatus;
}

export function StatusDot({ status }: StatusDotProps) {
  const meta = statusMeta[status];
  return <span className={`status-dot ${meta.tone}`} title={meta.title} />;
}

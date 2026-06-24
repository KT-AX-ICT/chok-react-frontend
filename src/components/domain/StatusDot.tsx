import type { LogStatus } from "../../domain/constants";

// none(비FATAL)은 점을 그리지 않는다. 나머지 3-state만 톤/툴팁을 가진다.
const statusMeta: Record<Exclude<LogStatus, "none">, { tone: string; title: string }> = {
  pending: { tone: "pending", title: "분석 전" },
  normal: { tone: "success", title: "분석 결과 정상" },
  abnormal: { tone: "danger", title: "분석 결과 이상" },
};

interface StatusDotProps {
  status: LogStatus;
}

export function StatusDot({ status }: StatusDotProps) {
  if (status === "none") return null;
  const meta = statusMeta[status];
  return <span className={`status-dot ${meta.tone}`} title={meta.title} />;
}

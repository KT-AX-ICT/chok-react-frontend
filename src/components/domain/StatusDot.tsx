import { isAnomalyLabel } from "../../domain/constants";

interface StatusDotProps {
  label: string;
}

export function StatusDot({ label }: StatusDotProps) {
  const anomaly = isAnomalyLabel(label);
  return <span className={`status-dot ${anomaly ? "danger" : "success"}`} title={anomaly ? "이상 로그" : "정상 로그"} />;
}

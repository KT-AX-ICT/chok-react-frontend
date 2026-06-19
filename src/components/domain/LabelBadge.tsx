import { isAnomalyLabel } from "../../domain/constants";

interface LabelBadgeProps {
  value: string;
}

export function LabelBadge({ value }: LabelBadgeProps) {
  if (!isAnomalyLabel(value)) return <span className="badge muted">정상</span>;
  return <span className="badge danger">{value}</span>;
}

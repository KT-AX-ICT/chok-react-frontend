import { riskMeta } from "../../domain/constants";
import type { RiskLevel } from "../../domain/analyses/types";

interface RiskBadgeProps {
  value: RiskLevel;
}

export function RiskBadge({ value }: RiskBadgeProps) {
  const meta = riskMeta[value];
  return <span className={`badge ${meta.tone}`}>{meta.label}</span>;
}

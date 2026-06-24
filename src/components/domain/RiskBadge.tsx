import { riskMeta } from "../../domain/constants";
import type { RiskLevel } from "../../domain/risk";

interface RiskBadgeProps {
  // 백엔드는 정상 판정 분석에 riskLevel=null을 내려준다. enum 밖 값도 방어한다.
  value: RiskLevel | null;
}

export function RiskBadge({ value }: RiskBadgeProps) {
  if (!value) return <span className="badge muted">정상</span>;
  const meta = riskMeta[value];
  if (!meta) return <span className="badge muted">{value}</span>;
  return <span className={`badge ${meta.tone}`}>{meta.label}</span>;
}

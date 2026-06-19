import { levelMeta } from "../../domain/constants";
import type { LogLevel } from "../../domain/log/types";

interface LevelBadgeProps {
  value: LogLevel;
}

export function LevelBadge({ value }: LevelBadgeProps) {
  const meta = levelMeta[value];
  return <span className={`badge ${meta.tone}`}>{meta.label}</span>;
}

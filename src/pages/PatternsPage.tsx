import { Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { listPatterns } from "../api/patterns";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import { riskMeta } from "../domain/constants";
import type { RiskLevel } from "../domain/analyses/types";
import type { PatternSummary } from "../domain/patterns/types";

const riskBars: Array<{ key: RiskLevel; color: string }> = [
  { key: "CRITICAL", color: "#ef4444" },
  { key: "HIGH", color: "#f97316" },
  { key: "MEDIUM", color: "#f59e0b" },
  { key: "LOW", color: "#10b981" },
];

const riskTextClass: Record<RiskLevel, string> = {
  CRITICAL: "text-danger",
  HIGH: "text-orange",
  MEDIUM: "text-warning",
  LOW: "text-success",
};

export default function PatternsPage() {
  const [patterns, setPatterns] = useState<PatternSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listPatterns()
      .then((response) => {
        setPatterns(response);
        setError(null);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <div className="screen-header-title">
            <Activity size={15} />
            <span>패턴 클러스터</span>
            <span className="count-chip">{patterns.length}개 클러스터</span>
          </div>
          <p className="screen-header-note">구조적 템플릿 기반으로 그룹화된 반복 로그 패턴입니다.</p>
        </div>
      </div>
      {error && <ErrorState message={error} />}
      {loading && <LoadingState />}
      {!loading && !error && (
        <div className="screen-scroll scrollbar-hide">
          <div className="pattern-grid">
            {patterns.map((pattern, index) => {
              const max = Math.max(pattern.occurrences, 1);
              return (
                <div key={pattern.id} className="pattern-card">
                  <div className="pattern-card-head">
                    <div>
                      <small>클러스터 #{index + 1}</small>
                      <h3>{pattern.title}</h3>
                    </div>
                    <span className="count-chip bg-primary/10 text-primary">
                      {pattern.occurrences.toLocaleString()}회 발생
                    </span>
                  </div>
                  <p className="pattern-desc">{pattern.description}</p>
                  <div className="pattern-template">
                    <p>이벤트 템플릿</p>
                    <code>{pattern.eventTemplate}</code>
                  </div>
                  <div className="risk-bars">
                    {riskBars.map((risk) => {
                      const value = risk.key === pattern.riskLevel ? pattern.occurrences : 0;
                      return (
                        <div className="risk-bar" key={risk.key}>
                          <span className={riskTextClass[risk.key]}>{riskMeta[risk.key].label}</span>
                          <div className="risk-bar-track">
                            {value > 0 && <div className="risk-bar-fill" style={{ width: `${(value / max) * 100}%`, backgroundColor: risk.color }} />}
                          </div>
                          <span className="text-right text-faint">{value}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="pattern-times">
                    <span>첫 발생: {pattern.firstSeen}</span>
                    <span>최근 발생: {pattern.lastSeen}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

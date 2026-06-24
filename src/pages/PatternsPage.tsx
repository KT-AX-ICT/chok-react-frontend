import { Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { listPatterns } from "../api/patterns";
import { getApiErrorMessage } from "../api/client";
import { PageHeader } from "../components/layout/PageHeader";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import { EmptyState } from "../components/common/EmptyState";
import { RISK_ORDER, riskColor, riskToneClass } from "../domain/risk";
import type { PatternSummary } from "../domain/patterns/types";

// 위험도 막대: SSOT(../risk)의 순서·색을 그대로 사용.
const riskBars = RISK_ORDER.map((key) => ({ key, color: riskColor[key] }));

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
      .catch((err: unknown) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="screen">
      <PageHeader
        icon={Activity}
        title="패턴 클러스터"
        chip={<span className="count-chip">{patterns.length}개 클러스터</span>}
        note="구조적 템플릿 기반으로 그룹화된 반복 로그 패턴입니다."
      />
      {error && <ErrorState message={error} />}
      {loading && <LoadingState />}
      {!loading && !error && patterns.length === 0 && (
        <EmptyState message="표시할 패턴이 없습니다." />
      )}
      {!loading && !error && patterns.length > 0 && (
        <div className="screen-scroll scrollbar-slim">
          <div className="pattern-grid">
            {patterns.map((pattern) => {
              const max = Math.max(pattern.count, 1);
              return (
                <div key={pattern.patternId} className="pattern-card">
                  <div className="pattern-card-head">
                    <div>
                      <small>클러스터 #{pattern.patternId}</small>
                      <h3>{pattern.patternName}</h3>
                    </div>
                    <span className="count-chip bg-primary/10 text-primary">
                      {pattern.count.toLocaleString()}회 발생
                    </span>
                  </div>
                  <p className="pattern-desc">{pattern.description}</p>
                  <div className="pattern-template">
                    <p>대표 로그</p>
                    <code>{pattern.representativeLog}</code>
                  </div>
                  <div className="risk-bars">
                    {riskBars.map((risk) => {
                      // 패턴 위험도(소속 분석 최고 위험도) 막대. 백엔드가 분포를 주지 않으므로
                      // 해당 위험도 칸만 count로 채운다(단일 값 기준).
                      const value = risk.key === pattern.riskLevel ? pattern.count : 0;
                      return (
                        <div className="risk-bar" key={risk.key}>
                          <span className={riskToneClass[risk.key]}>{risk.key}</span>
                          <div className="risk-bar-track">
                            {value > 0 && <div className="risk-bar-fill" style={{ width: `${(value / max) * 100}%`, backgroundColor: risk.color }} />}
                          </div>
                          <span className="text-right text-faint">{value}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="pattern-times">
                    <span>중요도 {pattern.importance}</span>
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

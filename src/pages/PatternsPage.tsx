import { Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { listPatterns } from "../api/patterns";
import { PageHeader } from "../components/layout/PageHeader";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import { RISK_ORDER, riskColor, riskToneClass } from "../domain/risk";
import type { PatternView } from "../domain/patterns/types";

// 위험도 막대: SSOT(../risk)의 순서·색을 그대로 사용.
const riskBars = RISK_ORDER.map((key) => ({ key, color: riskColor[key] }));

export default function PatternsPage() {
  const [patterns, setPatterns] = useState<PatternView[]>([]);
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
      <PageHeader
        icon={Activity}
        title="패턴 클러스터"
        chip={<span className="count-chip">{patterns.length}개 클러스터</span>}
        note="구조적 템플릿 기반으로 그룹화된 반복 로그 패턴입니다."
      />
      {error && <ErrorState message={error} />}
      {loading && <LoadingState />}
      {!loading && !error && (
        <div className="screen-scroll scrollbar-hide">
          <div className="pattern-grid">
            {patterns.map((pattern) => {
              // 파생 필드(occurrences/riskLevel/firstSeen/lastSeen)는 PatternView entity에 없는
              // 집계·분석 값이라 백엔드 미제공. 현재는 mock 값 기준으로 동작하며 없으면 폴백 처리.
              const occurrences = pattern.occurrences ?? 0;
              const max = Math.max(occurrences, 1);
              return (
                <div key={pattern.id} className="pattern-card">
                  <div className="pattern-card-head">
                    <div>
                      <small>클러스터 #{pattern.id}</small>
                      <h3>{pattern.patternName}</h3>
                    </div>
                    <span className="count-chip bg-primary/10 text-primary">
                      {occurrences.toLocaleString()}회 발생
                    </span>
                  </div>
                  <p className="pattern-desc">{pattern.description}</p>
                  <div className="pattern-template">
                    <p>이벤트 템플릿</p>
                    <code>{pattern.eventTemplate}</code>
                  </div>
                  <div className="risk-bars">
                    {riskBars.map((risk) => {
                      const value = risk.key === pattern.riskLevel ? occurrences : 0;
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
                    <span>첫 발생: {pattern.firstSeen ?? "-"}</span>
                    <span>최근 발생: {pattern.lastSeen ?? "-"}</span>
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

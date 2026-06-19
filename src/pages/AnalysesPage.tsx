import { AlertTriangle, ChevronDown, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listAnalyses } from "../api/analyses";
import { FilterSelect } from "../components/common/FilterSelect";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import { RiskBadge } from "../components/domain/RiskBadge";
import { riskMeta } from "../domain/constants";
import type { AnalysisSummary } from "../domain/analyses/types";

const riskOptions = [
  { value: "ALL", label: "전체 위험도" },
  { value: "CRITICAL", label: "긴급" },
  { value: "HIGH", label: "높음" },
  { value: "MEDIUM", label: "보통" },
  { value: "LOW", label: "낮음" },
];

export default function AnalysesPage() {
  const [items, setItems] = useState<AnalysisSummary[]>([]);
  const [riskLevel, setRiskLevel] = useState("ALL");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    listAnalyses({ riskLevel, keyword })
      .then((response) => {
        setItems(response);
        setError(null);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [riskLevel, keyword]);

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <div className="screen-header-title">
            <AlertTriangle size={14} className="text-danger" />
            <span>주의 로그 AI 분석</span>
            <span className="count-chip bg-danger/10 text-danger">{items.length}</span>
            <span className="text-[10px] text-faint">최근 24시간 · 위험도 높은 순</span>
          </div>
        </div>
        <div className="toolbar-spacer" />
        <FilterSelect label="Risk" value={riskLevel} options={riskOptions} onChange={setRiskLevel} />
        <button className="pill-button" type="button">최근 24시간</button>
        <label className="search-control">
          <Search size={12} />
          <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="라벨, 노드, 근거 검색..." />
        </label>
      </div>

      {error && <ErrorState message={error} />}
      {loading && <LoadingState />}
      {!loading && !error && (
        <div className="analysis-list scrollbar-hide">
          <div className="analysis-header-grid">
            <span />
            <span>Timestamp</span>
            <span>Node</span>
            <span>위험도</span>
            <span>패턴 클러스터</span>
            <span>AI 요약</span>
            <span />
          </div>
          {items.map((item) => (
            <div className={`analysis-row-wrap risk-${item.riskLevel}`} key={item.id}>
              <Link to={`/analyses/${item.id}`} className="analysis-row">
                <ChevronDown size={11} className="text-muted" />
                <span className="whitespace-nowrap text-muted">{item.timestamp}</span>
                <span className="truncate">{item.node}</span>
                <RiskBadge value={item.riskLevel} />
                <span className="tone-chip truncate">{item.patternId ? `${item.patternId} - ${riskMeta[item.riskLevel].label}` : "-"}</span>
                <span className="truncate">{item.reason}</span>
                <span className="detail-link">상세 →</span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

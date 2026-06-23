import { AlertTriangle, ChevronDown, ChevronUp, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listAnalyses } from "../api/analyses";
import { PageHeader } from "../components/layout/PageHeader";
import { FilterSelect } from "../components/common/FilterSelect";
import { DateFilter, type DateFilterValue } from "../components/common/DateFilter";
import { Pagination } from "../components/common/Pagination";
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

const PAGE_SIZE = 20;

export default function AnalysesPage() {
  const [items, setItems] = useState<AnalysisSummary[]>([]);
  const [riskLevel, setRiskLevel] = useState("ALL");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [dateFilter, setDateFilter] = useState<DateFilterValue>({ selectedDate: "", recent24h: true });
  const [page, setPage] = useState(1);

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

  // 날짜 필터는 순수 UI 껍질 — 실제 필터링 없이 캘린더 활성 표시에만 사용.
  const activeDates = useMemo(
    () => new Set(items.map((item) => item.timestamp.slice(0, 10))),
    [items],
  );

  const totalPages = Math.ceil(items.length / PAGE_SIZE);

  const toggle = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="screen">
      <PageHeader
        icon={AlertTriangle}
        iconClassName="text-danger"
        title="주의 로그 AI 분석"
        chip={<span className="count-chip bg-danger/10 text-danger">{items.length}</span>}
        note="최근 24시간 · 위험도 높은 순"
        actions={
          <>
            <FilterSelect label="Risk" value={riskLevel} options={riskOptions} onChange={setRiskLevel} />
            <DateFilter value={dateFilter} activeDates={activeDates} onChange={setDateFilter} />
            <label className="search-control">
              <Search size={12} />
              <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="라벨, 노드, 근거 검색..." />
            </label>
          </>
        }
      />

      {error && <ErrorState message={error} />}
      {loading && <LoadingState />}
      {!loading && !error && (
        <>
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
            {items.map((item) => {
              const isOpen = expanded.has(item.id);
              const clusterLabel = item.patternId
                ? `${item.patternId} - ${riskMeta[item.riskLevel].label}`
                : "-";
              return (
                <div className={`analysis-row-wrap risk-${item.riskLevel}`} key={item.id}>
                  <div
                    className="analysis-row cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onClick={() => toggle(item.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        toggle(item.id);
                      }
                    }}
                  >
                    {isOpen ? (
                      <ChevronUp size={11} className="text-muted" />
                    ) : (
                      <ChevronDown size={11} className="text-muted" />
                    )}
                    <span className="whitespace-nowrap text-muted">{item.timestamp}</span>
                    <span className="truncate">{item.node}</span>
                    <RiskBadge value={item.riskLevel} />
                    <span className="tone-chip truncate">{clusterLabel}</span>
                    <span className="truncate">{item.reason}</span>
                    <Link
                      to={`/analyses/${item.id}`}
                      className="detail-link"
                      onClick={(event) => event.stopPropagation()}
                    >
                      상세 →
                    </Link>
                  </div>

                  {isOpen && (
                    <div className="accordion-panel">
                      <div className="accordion-head">
                        <span className="accordion-head-label">AI 분석</span>
                        <RiskBadge value={item.riskLevel} />
                      </div>
                      <div className="accordion-body">
                        <p>{item.reason}</p>
                      </div>
                      {item.patternId && (
                        <div className="accordion-chips">
                          <span className="tone-chip">{item.patternId}</span>
                          <span className="tone-chip">{riskMeta[item.riskLevel].label}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={items.length}
            pageSize={PAGE_SIZE}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}

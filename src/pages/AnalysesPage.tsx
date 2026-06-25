import { AlertTriangle, ChevronDown, ChevronUp, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { listAnalyses } from "../api/analyses";
import { getApiErrorMessage } from "../api/client";
import { PageHeader } from "../components/layout/PageHeader";
import { FilterSelect } from "../components/common/FilterSelect";
import { DateFilter, type DateFilterValue } from "../components/common/DateFilter";
import { Pagination } from "../components/common/Pagination";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import { EmptyState } from "../components/common/EmptyState";
import { RiskBadge } from "../components/domain/RiskBadge";
import type { AnalysisSummary } from "../domain/analyses/types";

const riskOptions = [
  { value: "ALL", label: "전체 위험도" },
  { value: "긴급", label: "긴급" },
  { value: "높음", label: "높음" },
  { value: "보통", label: "보통" },
  { value: "낮음", label: "낮음" },
];

const PAGE_SIZE = 20;

// 백엔드 pattern_view 미분류 sentinel(=99). seed 제목은 "미분류 (관리자 검토 필요)"지만 컬럼엔 짧게 표기.
const UNCLASSIFIED_CLUSTER_ID = 99;

// "2026-06-25T17:05:40.593643" → "2026-06-25 17:05:40" (초까지, T→공백). mock의 공백 형식도 그대로 통과.
function formatTimestamp(value: string) {
  return value.slice(0, 19).replace("T", " ");
}

export default function AnalysesPage() {
  // URL query를 상태의 단일 출처로 사용(새로고침/북마크 복원). proxy와 무관 — URL을 읽어 요청에 반영할 뿐.
  // 백엔드 /analysis는 page/size + keyword(summary·analysis·action) 지원.
  //   keyword·page는 서버 처리, 위험도/날짜는 "현재 페이지 내" 클라이언트 필터(서버 미지원).
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page")) || 1); // 1-base(UI)
  const riskLevel = searchParams.get("risk") ?? "ALL";
  const keyword = searchParams.get("q") ?? "";
  const date = searchParams.get("date") ?? "";

  const [items, setItems] = useState<AnalysisSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [keywordInput, setKeywordInput] = useState(keyword);

  function updateParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    if (!("page" in next)) params.delete("page"); // 필터 변경 시 page 리셋
    setSearchParams(params);
  }

  useEffect(() => {
    setKeywordInput(keyword);
  }, [keyword]);

  useEffect(() => {
    setLoading(true);
    listAnalyses({ page: page - 1, size: PAGE_SIZE, keyword: keyword || undefined })
      .then((response) => {
        setItems(response.items);
        setTotal(response.total);
        setTotalPages(Math.max(1, response.totalPages));
        setError(null);
        if (response.totalPages >= 1 && page > response.totalPages) {
          const params = new URLSearchParams(searchParams);
          params.set("page", String(response.totalPages));
          setSearchParams(params, { replace: true });
        }
      })
      .catch((err: unknown) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, keyword]);

  // keyword는 서버검색이라 제외 — 위험도/날짜만 현재 페이지 내 클라이언트 필터(서버 미지원).
  const filtered = useMemo(() => {
    return items
      .filter((item) => riskLevel === "ALL" || item.riskLevel === riskLevel)
      .filter((item) => {
        // 날짜 선택 시 그 하루, 미선택(최근 24시간) 시 현재 시각 기준 24시간 이내.
        if (date) return item.log.occurredAt.slice(0, 10) === date;
        return new Date(item.log.occurredAt).getTime() >= Date.now() - 24 * 60 * 60 * 1000;
      });
  }, [items, riskLevel, date]);

  const dateValue: DateFilterValue = { selectedDate: date, recent24h: !date };

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
        chip={<span className="count-chip bg-danger/10 text-danger">{total}</span>}
        note="최근 24시간 · 위험도 높은 순"
        actions={
          <>
            <FilterSelect
              label="Risk"
              value={riskLevel}
              options={riskOptions}
              onChange={(value) => updateParams({ risk: value === "ALL" ? "" : value })}
            />
            <DateFilter
              value={dateValue}
              onChange={(value) => updateParams({ date: value.selectedDate })}
            />
            <label className="search-control">
              <Search size={12} />
              <input
                value={keywordInput}
                onChange={(event) => setKeywordInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") updateParams({ q: keywordInput.trim() });
                }}
                placeholder="요약·분석·대응 검색 후 Enter..."
              />
            </label>
          </>
        }
      />

      {error && <ErrorState message={error} />}
      {loading && <LoadingState />}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState message="표시할 분석 결과가 없습니다." />
      )}
      {!loading && !error && filtered.length > 0 && (
        <>
          <div className="analysis-list scrollbar-slim">
            <div className="analysis-header-grid">
              <span />
              <span>Timestamp</span>
              <span>Node</span>
              <span className="text-center">위험도</span>
              <span>패턴 클러스터</span>
              <span>AI 요약</span>
              <span />
            </div>
            {filtered.map((item) => {
              const isOpen = expanded.has(item.analysisId);
              // 미분류(99)는 짧게 "미분류", 그 외엔 patternName, 없으면 #clusterId, 패턴 없으면 빈칸.
              const patternLabel =
                item.clusterId === UNCLASSIFIED_CLUSTER_ID
                  ? "미분류"
                  : item.patternName ?? (item.clusterId != null ? `#${item.clusterId}` : "");
              return (
                <div className={`analysis-row-wrap risk-${item.riskLevel}`} key={item.analysisId}>
                  <div
                    className="analysis-row cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onClick={() => toggle(item.analysisId)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        toggle(item.analysisId);
                      }
                    }}
                  >
                    {isOpen ? (
                      <ChevronUp size={11} className="text-muted" />
                    ) : (
                      <ChevronDown size={11} className="text-muted" />
                    )}
                    <span className="whitespace-nowrap text-muted">{formatTimestamp(item.log.occurredAt)}</span>
                    <span className="truncate">{item.log.node}</span>
                    <span className="flex justify-center">
                      <RiskBadge value={item.riskLevel} />
                    </span>
                    <span className="tone-chip truncate" title={patternLabel}>{patternLabel}</span>
                    <span className="truncate">{item.aiSummary}</span>
                    <Link
                      to={`/analyses/${item.log.logId}`}
                      className="detail-link"
                      onClick={(event) => event.stopPropagation()}
                    >
                      상세 →
                    </Link>
                  </div>

                  {isOpen && (
                    <div className="accordion-panel">
                      <div className="accordion-head">
                        <span className="accordion-section-label">분석</span>
                        <RiskBadge value={item.riskLevel} />
                      </div>
                      <div className="accordion-body">
                        <p>{item.analysis}</p>
                        {item.responsePlan.length > 0 && (
                          <>
                            <p className="accordion-section-label mt-4 mb-0.5">권고 조치 (참고용)</p>
                            <p className="mb-1.5 text-[13px] text-muted">
                              AI가 제시하는 참고 권고이며, 실제 조치 여부는 담당자가 판단합니다.
                            </p>
                            <ol className="response-plan">
                              {item.responsePlan.map((step, index) => (
                                <li key={index}>{step}</li>
                              ))}
                            </ol>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onChange={(next) => updateParams({ page: String(next) })}
          />
        </>
      )}
    </div>
  );
}

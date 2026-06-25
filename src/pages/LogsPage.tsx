import { AlertTriangle, List, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { listLogs } from "../api/logs";
import { getApiErrorMessage } from "../api/client";
import { PageHeader } from "../components/layout/PageHeader";
import { FilterSelect } from "../components/common/FilterSelect";
import { DateFilter, type DateFilterValue } from "../components/common/DateFilter";
import { Pagination } from "../components/common/Pagination";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import { EmptyState } from "../components/common/EmptyState";
import { LevelBadge } from "../components/domain/LevelBadge";
import { StatusDot } from "../components/domain/StatusDot";
import { logStatus } from "../domain/constants";
import type { LogEntry } from "../domain/log/types";

const levelOptions = [
  { value: "ALL", label: "전체 레벨" },
  { value: "FATAL", label: "FATAL" },
  { value: "SEVERE", label: "SEVERE" },
  { value: "ERROR", label: "ERROR" },
  { value: "WARNING", label: "WARNING" },
  { value: "INFO", label: "INFO" },
];

const pageSize = 20;

// Date → 로컬 ISO LocalDateTime("YYYY-MM-DDTHH:mm:ss", 타임존/밀리초 없음 — 백엔드 LocalDateTime 형식).
function toLocalIso(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

// LocalDateTime("2024-09-23T11:44:32")의 ISO 'T' 구분자를 공백으로, 초까지만 표시.
function formatTimestamp(value: string) {
  return value.slice(0, 19).replace("T", " ");
}

// 조회 범위. 날짜 선택 시 그 하루, 미선택(최근 24시간) 시 "현재 시각 기준 24시간 전 ~ 지금".
// (백엔드 기본값에 맡기면 전체가 내려오므로 항상 명시적으로 범위를 보낸다.)
function rangeFor(date: string) {
  if (date) return { startAt: `${date}T00:00:00`, endAt: `${date}T23:59:59` };
  const now = new Date();
  return { startAt: toLocalIso(new Date(now.getTime() - 24 * 60 * 60 * 1000)), endAt: toLocalIso(now) };
}

export default function LogsPage() {
  // URL query를 페이지 상태의 단일 출처로 사용 → 새로고침/북마크/뒤로가기 시 그대로 복원된다.
  // (proxy와 무관: 브라우저 URL을 읽어 listLogs params로 번역할 뿐이다.)
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = Math.max(1, Number(searchParams.get("page")) || 1); // 1-base(UI), 호출 시 -1
  const level = searchParams.get("level") ?? "ALL";
  const date = searchParams.get("date") ?? "";
  const keyword = searchParams.get("q") ?? "";
  const abnormalOnly = searchParams.get("abnormal") === "1"; // "이상만"(isAbnormal=true) 토글

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keywordInput, setKeywordInput] = useState(keyword);

  // URL 파라미터 일부만 갱신(나머지 보존). 필터 변경 시 page는 1로 리셋(page 키를 직접 안 넘긴 경우).
  function updateParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    if (!("page" in next)) params.delete("page");
    setSearchParams(params);
  }

  useEffect(() => {
    setKeywordInput(keyword);
  }, [keyword]);

  useEffect(() => {
    setLoading(true);
    const range = rangeFor(date);
    listLogs({
      page: page - 1,
      size: pageSize,
      logLevel: level !== "ALL" ? level : undefined,
      keyword: keyword || undefined,
      startAt: range.startAt,
      endAt: range.endAt,
      isAbnormal: abnormalOnly ? true : undefined,
    })
      .then((response) => {
        setLogs(response.items);
        setTotal(response.total);
        setTotalPages(Math.max(1, response.totalPages));
        setError(null);
        // out-of-range 클램프: 데이터 변경으로 요청 page가 실제 totalPages를 넘으면 마지막 페이지로.
        if (response.totalPages >= 1 && page > response.totalPages) {
          const params = new URLSearchParams(searchParams);
          params.set("page", String(response.totalPages));
          setSearchParams(params, { replace: true });
        }
      })
      .catch((err: unknown) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, level, date, keyword, abnormalOnly]);

  const dateValue: DateFilterValue = { selectedDate: date, recent24h: !date };

  return (
    <div className="screen">
      <PageHeader
        icon={List}
        title="시스템 로그"
        chip={<span className="count-chip">{total}</span>}
        note={date ? `${date} 수집 로그` : "최근 24시간 수집 로그"}
        actions={
          <>
            <FilterSelect
              label="Level"
              value={level}
              options={levelOptions}
              onChange={(value) => updateParams({ level: value === "ALL" ? "" : value })}
            />
            <button
              type="button"
              className={`date-toggle ${abnormalOnly ? "active" : ""}`}
              onClick={() => updateParams({ abnormal: abnormalOnly ? "" : "1" })}
            >
              <AlertTriangle size={12} />
              이상만
            </button>
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
                placeholder="내용 검색 후 Enter..."
              />
            </label>
          </>
        }
      />

      {error && <ErrorState message={error} />}
      {loading && <LoadingState />}
      {!loading && !error && logs.length === 0 && (
        <EmptyState message="표시할 로그가 없습니다." />
      )}
      {!loading && !error && logs.length > 0 && (
        <>
          <div className="table-region scrollbar-slim">
            <table>
              {/* 컬럼 폭 고정(table-fixed). Content만 가변 폭으로 줄바꿈 표시. */}
              <colgroup>
                <col className="w-4" />
                <col className="w-12" />
                <col className="w-14" />
                <col className="w-[190px]" />
                <col className="w-[210px]" />
                <col className="w-[140px]" />
                <col className="w-24" />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th />
                  <th>#</th>
                  <th className="text-center">Status</th>
                  <th>Node</th>
                  <th className="pr-10 text-center">발생 시각</th>
                  <th>Component</th>
                  <th className="text-center">Level</th>
                  <th>Content</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => {
                  // status 점: FATAL만 표시. 분석 전(회색)/정상(초록)/이상(빨강) — 서버 isCaution·isAnalysis 기반.
                  const status = logStatus(log);
                  // # 컬럼: 백엔드에 lineNumber가 없어 페이지 기준 일련번호로 파생.
                  const rowNumber = (page - 1) * pageSize + index + 1;
                  // 행 클릭 = 분석 상세 진입(/analyses/:logId 재사용). 별도 링크 컬럼 없음.
                  const openDetail = () => navigate(`/analyses/${log.logId}`);
                  return (
                    <tr
                      key={log.logId}
                      className="cursor-pointer"
                      role="button"
                      tabIndex={0}
                      onClick={openDetail}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openDetail();
                        }
                      }}
                    >
                      <td>{status === "abnormal" && <span className="row-marker" />}</td>
                      <td className="text-faint">{rowNumber}</td>
                      <td><StatusDot status={status} /></td>
                      <td className="truncate">{log.node}</td>
                      <td className="whitespace-nowrap pr-10 text-muted">{formatTimestamp(log.occurredAt)}</td>
                      <td className="truncate">{log.component}</td>
                      <td><LevelBadge value={log.logLevel} /></td>
                      <td className="cell-content">{log.content}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={pageSize}
            onChange={(next) => updateParams({ page: String(next) })}
          />
        </>
      )}
    </div>
  );
}

import { List, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
import { isAbnormalLog } from "../domain/constants";
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
  const page = Math.max(1, Number(searchParams.get("page")) || 1); // 1-base(UI), 호출 시 -1
  const level = searchParams.get("level") ?? "ALL";
  const date = searchParams.get("date") ?? "";
  const keyword = searchParams.get("q") ?? "";

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
  }, [page, level, date, keyword]);

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
          <div className="table-region scrollbar-hide">
            <table>
              <thead>
                <tr>
                  <th />
                  <th>#</th>
                  <th>Status</th>
                  <th>Node</th>
                  <th>Timestamp</th>
                  <th>Component</th>
                  <th>Level</th>
                  <th>Content</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => {
                  // isAbnormalLog는 { level, isAbnormal } 형태를 받음(constants.ts SSOT, 수정 금지).
                  const abnormal = isAbnormalLog({ level: log.logLevel });
                  // # 컬럼: 백엔드에 lineNumber가 없어 페이지 기준 일련번호로 파생.
                  const rowNumber = (page - 1) * pageSize + index + 1;
                  return (
                    <tr key={log.logId}>
                      <td>{abnormal && <span className="row-marker" />}</td>
                      <td className="text-faint">{rowNumber}</td>
                      <td><StatusDot abnormal={abnormal} /></td>
                      <td>{log.node}</td>
                      <td className="whitespace-nowrap text-muted">{log.occurredAt}</td>
                      <td>{log.component}</td>
                      <td><LevelBadge value={log.logLevel} /></td>
                      <td className="wide">{log.content}</td>
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

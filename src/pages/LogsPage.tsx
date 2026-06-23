import { List, Search } from "lucide-react";
import { useEffect, useState } from "react";
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

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [level, setLevel] = useState("ALL");
  const [keyword, setKeyword] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilterValue>({ selectedDate: "", recent24h: true });
  const [page, setPage] = useState(1); // 1-base(UI). 백엔드 Pageable은 0-base라 호출 시 -1.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 캘린더에 점 표시용 — 로그 occurredAt의 날짜부분(YYYY-MM-DD)만 모은다.
  const activeDates = new Set(logs.map((log) => String(log.occurredAt).slice(0, 10)));

  useEffect(() => {
    setLoading(true);
    // TODO(filter): level/keyword/dateFilter를 LogQuery(LogSearchCondition)로 전달.
    //   현재는 page/size만 서버에 보내고 필터 UI는 화면 유지용으로만 둔다.
    listLogs({ page: page - 1, size: pageSize })
      .then((response) => {
        setLogs(response.items);
        setTotal(response.total);
        setTotalPages(Math.max(1, response.totalPages));
        setError(null);
      })
      .catch((err: unknown) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="screen">
      <PageHeader
        icon={List}
        title="시스템 로그"
        chip={<span className="count-chip">{total}</span>}
        note="최근 24시간 수집 로그"
        actions={
          <>
            {/* TODO(filter): 아래 컨트롤들은 아직 서버 필터에 연결되지 않음(화면 유지용). */}
            <FilterSelect label="Level" value={level} options={levelOptions} onChange={setLevel} />
            <DateFilter value={dateFilter} activeDates={activeDates} onChange={setDateFilter} />
            <label className="search-control">
              <Search size={12} />
              <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="노드, 내용 검색..." />
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
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}

import { List, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { listLogs } from "../api/logs";
import { PageHeader } from "../components/layout/PageHeader";
import { FilterSelect } from "../components/common/FilterSelect";
import { DateFilter, type DateFilterValue } from "../components/common/DateFilter";
import { Pagination } from "../components/common/Pagination";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
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

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [level, setLevel] = useState("ALL");
  const [keyword, setKeyword] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilterValue>({ selectedDate: "", recent24h: true });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 캘린더에 점 표시용 — 로그 timestamp의 날짜부분(YYYY-MM-DD)만 모은다.
  const activeDates = new Set(logs.map((log) => String(log.timestamp).slice(0, 10)));

  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(logs.length / pageSize));

  useEffect(() => {
    setLoading(true);
    listLogs({ level, keyword })
      .then((response) => {
        setLogs(response.items);
        setError(null);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [level, keyword]);

  return (
    <div className="screen">
      <PageHeader
        icon={List}
        title="시스템 로그"
        chip={<span className="count-chip">{logs.length}</span>}
        note="최근 24시간 수집 로그"
        actions={
          <>
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
      {!loading && !error && (
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
                {logs.map((log) => {
                  const abnormal = isAbnormalLog(log);
                  return (
                    <tr key={log.id}>
                      <td>{abnormal && <span className="row-marker" />}</td>
                      <td className="text-faint">{log.lineNumber}</td>
                      <td><StatusDot abnormal={abnormal} /></td>
                      <td>{log.node}</td>
                      <td className="whitespace-nowrap text-muted">{log.timestamp}</td>
                      <td>{log.component}</td>
                      <td><LevelBadge value={log.level} /></td>
                      <td className="wide">{log.message}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={logs.length}
            pageSize={pageSize}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}

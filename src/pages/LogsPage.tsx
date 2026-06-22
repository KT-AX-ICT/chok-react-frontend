import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { listLogs } from "../api/logs";
import { FilterSelect } from "../components/common/FilterSelect";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import { LevelBadge } from "../components/domain/LevelBadge";
import { StatusDot } from "../components/domain/StatusDot";
import type { LogEntry } from "../domain/log/types";

const levelOptions = [
  { value: "ALL", label: "전체 레벨" },
  { value: "FATAL", label: "FATAL" },
  { value: "ERROR", label: "ERROR" },
  { value: "WARN", label: "WARN" },
  { value: "INFO", label: "INFO" },
  { value: "DEBUG", label: "DEBUG" },
];

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [level, setLevel] = useState("ALL");
  const [label, setLabel] = useState("ALL");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const labelOptions = useMemo(() => {
    const labels = Array.from(new Set(logs.map((log) => log.label))).sort();
    return [{ value: "ALL", label: "전체 라벨" }, ...labels.map((item) => ({ value: item, label: item === "-" ? "정상(-)" : item }))];
  }, [logs]);

  useEffect(() => {
    setLoading(true);
    listLogs({ level, label, keyword })
      .then((response) => {
        setLogs(response.items);
        setError(null);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [level, label, keyword]);

  return (
    <div className="screen">
      <div className="table-toolbar">
        <FilterSelect label="Level" value={level} options={levelOptions} onChange={setLevel} />
        <FilterSelect label="Label" value={label} options={labelOptions} onChange={setLabel} />
        <button className="pill-button" type="button">최근 24시간</button>
        <div className="toolbar-spacer" />
        <label className="search-control">
          <Search size={12} />
          <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="노드, 내용 검색..." />
        </label>
      </div>

      {error && <ErrorState message={error} />}
      {loading && <LoadingState />}
      {!loading && !error && (
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
                const isAlert = log.label !== "-";
                return (
                  <tr key={log.id}>
                    <td>{isAlert && <span className="row-marker" />}</td>
                    <td className="text-faint">{log.lineNumber}</td>
                    <td><StatusDot label={log.label} /></td>
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
      )}
    </div>
  );
}

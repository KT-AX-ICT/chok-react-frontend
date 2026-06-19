import { Activity, AlertTriangle, BarChart2, Circle, List } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { getDashboardSummary } from "../../api/dashboard";
import { listLogs } from "../../api/logs";
import type { DashboardSummary } from "../../domain/analyses/types";
import type { LogEntry } from "../../domain/log/types";

const navItems = [
  { to: "/dashboard", label: "대시보드", icon: BarChart2 },
  { to: "/logs", label: "시스템 로그", icon: List },
  { to: "/analyses", label: "주의 로그 분석", icon: AlertTriangle, countKey: "anomalyLogs" },
  { to: "/patterns", label: "패턴 분석", icon: Activity },
];

function formatDateRange(logs: LogEntry[]) {
  if (logs.length === 0) return "-";
  const dates = logs.map((log) => log.timestamp.slice(0, 10)).sort();
  const format = (date: string) => date.replaceAll("-", ".");
  return `${format(dates[0])} - ${format(dates[dates.length - 1])}`;
}

export function AppShell() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    Promise.all([getDashboardSummary(), listLogs()])
      .then(([dashboard, logResponse]) => {
        setSummary(dashboard);
        setLogs(logResponse.items);
      })
      .catch(() => {
        setSummary(null);
        setLogs([]);
      });
  }, []);

  const nodeCount = useMemo(() => new Set(logs.map((log) => log.node)).size, [logs]);
  const dateRange = useMemo(() => formatDateRange(logs), [logs]);

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="window-title">
          <div className="window-dots">
            <Circle size={7} className="dot-red" fill="currentColor" />
            <Circle size={7} className="dot-yellow" fill="currentColor" />
            <Circle size={7} className="dot-green" fill="currentColor" />
          </div>
          <span>LOGVIEW - AI-Powered Log Analysis</span>
        </div>
        <div className="live-status">
          <span />
          <strong>LIVE</strong>
        </div>
      </header>

      <div className="app-body">
        <aside className="side-nav">
          <p className="nav-title">Navigation</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                <Icon size={16} />
                <span>{item.label}</span>
                {"countKey" in item && summary && <strong className="nav-count">{summary.anomalyLogs}</strong>}
              </NavLink>
            );
          })}
          <div className="nav-meta">
            <p>{dateRange}</p>
            <p>총 {(summary?.totalLogs ?? logs.length).toLocaleString()} logs · {nodeCount.toLocaleString()} nodes</p>
          </div>
        </aside>

        <main className="page-frame">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

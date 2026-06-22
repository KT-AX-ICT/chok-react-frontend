import { Activity, AlertTriangle, BarChart2, Circle, List } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { getDashboard } from "../../api/dashboard";
import type { DashboardResponse } from "../../domain/dashboard/types";

const navItems = [
  { to: "/dashboard", label: "대시보드", icon: BarChart2 },
  { to: "/logs", label: "시스템 로그", icon: List },
  { to: "/analyses", label: "주의 로그 분석", icon: AlertTriangle, countKey: "caution" },
  { to: "/patterns", label: "패턴 분석", icon: Activity },
];

// "2026-06-21T21:00:00" -> "2026.06.21"
function formatDate(value: string) {
  return value.slice(0, 10).replaceAll("-", ".");
}

function formatRange(range: DashboardResponse["range"] | undefined) {
  if (!range) return "-";
  return `${formatDate(range.startAt)} - ${formatDate(range.endAt)}`;
}

export function AppShell() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);

  useEffect(() => {
    getDashboard()
      .then(setDashboard)
      .catch(() => setDashboard(null));
  }, []);

  const dateRange = useMemo(() => formatRange(dashboard?.range), [dashboard]);
  const cautionCount = dashboard?.stats.cautionLogCount ?? 0;
  const totalLogCount = dashboard?.stats.totalLogCount ?? 0;

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
                {"countKey" in item && dashboard && <strong className="nav-count">{cautionCount}</strong>}
              </NavLink>
            );
          })}
          <div className="nav-meta">
            <p>{dateRange}</p>
            <p>총 {totalLogCount.toLocaleString()} logs</p>
          </div>
        </aside>

        <main className="page-frame">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

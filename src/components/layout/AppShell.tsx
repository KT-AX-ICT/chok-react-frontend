import { Activity, AlertTriangle, BarChart2, Circle, List, Menu } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { getDashboard } from "../../api/dashboard";
import { ThemeToggle } from "./ThemeToggle";
import type { DashboardResponse } from "../../domain/dashboard/types";

const navItems = [
  { to: "/dashboard", label: "대시보드", icon: BarChart2 },
  { to: "/logs", label: "시스템 로그", icon: List },
  { to: "/analyses", label: "주의 로그 분석", icon: AlertTriangle, countKey: "abnormal" },
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
  // 모바일/태블릿(<1024) 드로어 열림 상태. 데스크탑(≥1024)에서는 사이드바가 고정이라 무시된다.
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    getDashboard()
      .then(setDashboard)
      .catch(() => setDashboard(null));
  }, []);

  // 라우트 이동 시 드로어 자동 닫기(좁은 화면).
  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  const dateRange = useMemo(() => formatRange(dashboard?.range), [dashboard]);
  // 배지 = 판정결과 '진짜 이상'(분석완료+이상). 대시보드 카드와 동일하게 abnormalLogCount 사용,
  // 미배포 구간엔 cautionLogCount로 폴백.
  const abnormalCount = dashboard?.stats.abnormalLogCount ?? dashboard?.stats.cautionLogCount ?? 0;
  const totalLogCount = dashboard?.stats.totalLogCount ?? 0;

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="window-title">
          <button
            type="button"
            className="nav-toggle"
            aria-label="메뉴 열기/닫기"
            aria-expanded={navOpen}
            onClick={() => setNavOpen((open) => !open)}
          >
            <Menu size={18} />
          </button>
          <div className="window-dots">
            <Circle size={7} className="dot-red" fill="currentColor" />
            <Circle size={7} className="dot-yellow" fill="currentColor" />
            <Circle size={7} className="dot-green" fill="currentColor" />
          </div>
          <Link to="/dashboard" className="brand" aria-label="대시보드로 이동">CHOK</Link>
          <span className="brand-sub">AI-Powered Log Analysis</span>
        </div>
        <ThemeToggle />
      </header>

      <div className="app-body">
        {/* 좁은 화면 드로어 배경 오버레이(데스크탑에서는 lg:hidden) */}
        {navOpen && <div className="nav-overlay" onClick={() => setNavOpen(false)} />}
        <aside className={`side-nav ${navOpen ? "nav-open" : ""}`}>
          <p className="nav-title">Navigation</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                <Icon size={16} />
                <span>{item.label}</span>
                {"countKey" in item && dashboard && <strong className="nav-count">{abnormalCount}</strong>}
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

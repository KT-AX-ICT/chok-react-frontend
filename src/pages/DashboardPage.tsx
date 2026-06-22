import { Activity, AlertTriangle, ChevronRight, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboard } from "../api/dashboard";
import { ErrorState } from "../components/common/ErrorState";
import { LoadingState } from "../components/common/LoadingState";
import { riskToneClassOf, toDashboardViewModel } from "../domain/dashboard/adapter";
import type { ChartPoint } from "../domain/dashboard/adapter";
import type { DashboardResponse } from "../domain/dashboard/types";

function AreaChart({ data }: { data: ChartPoint[] }) {
  const width = 600;
  const height = 120;
  const pad = { top: 8, right: 8, bottom: 24, left: 32 };
  const chartWidth = width - pad.left - pad.right;
  const chartHeight = height - pad.top - pad.bottom;
  const max = Math.max(...data.map((item) => item.total), 1);
  const xs = data.map((_, index) => pad.left + (index / Math.max(data.length - 1, 1)) * chartWidth);
  const totalY = data.map((item) => pad.top + chartHeight - (item.total / max) * chartHeight);
  const cautionY = data.map((item) => pad.top + chartHeight - (item.caution / max) * chartHeight);
  const bottom = pad.top + chartHeight;
  const polyline = (ys: number[]) => ys.map((y, index) => `${xs[index]},${y}`).join(" ");
  const area = (ys: number[]) => `${pad.left},${bottom} ${ys.map((y, index) => `${xs[index]},${y}`).join(" ")} ${xs[xs.length - 1]},${bottom}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
      <defs>
        <linearGradient id="total-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00c8e8" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#00c8e8" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="caution-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((tick) => (
        <line key={tick} x1={pad.left} x2={width - pad.right} y1={pad.top + chartHeight * (1 - tick)} y2={pad.top + chartHeight * (1 - tick)} stroke="#ffffff" strokeOpacity="0.04" />
      ))}
      <polygon points={area(totalY)} fill="url(#total-gradient)" />
      <polygon points={area(cautionY)} fill="url(#caution-gradient)" />
      <polyline points={polyline(totalY)} fill="none" stroke="#00c8e8" strokeWidth="1.5" strokeLinejoin="round" />
      <polyline points={polyline(cautionY)} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round" />
      {data.map((item, index) => index % 2 === 0 && (
        <text key={`${item.label}-${index}`} x={xs[index]} y={height - 4} textAnchor="middle" fontSize="8" fill="#374151" fontFamily="JetBrains Mono">{item.label}</text>
      ))}
    </svg>
  );
}

function DonutChart({ data }: { data: Array<{ riskLevel: string; count: number; color: string }> }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  let cumulative = 0;
  const toXY = (deg: number, radius: number) => {
    const rad = (deg - 90) * (Math.PI / 180);
    return { x: 50 + radius * Math.cos(rad), y: 50 + radius * Math.sin(rad) };
  };

  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 100 100" width="100" height="100">
        {data.map((item) => {
          if (total === 0 || item.count === 0) return null;
          const start = (cumulative / total) * 360;
          cumulative += item.count;
          const end = (cumulative / total) * 360;
          const large = end - start > 180 ? 1 : 0;
          const outerStart = toXY(start, 38);
          const outerEnd = toXY(end, 38);
          const innerStart = toXY(start, 26);
          const innerEnd = toXY(end, 26);
          return (
            <path
              key={item.riskLevel}
              d={`M ${outerStart.x} ${outerStart.y} A 38 38 0 ${large} 1 ${outerEnd.x} ${outerEnd.y} L ${innerEnd.x} ${innerEnd.y} A 26 26 0 ${large} 0 ${innerStart.x} ${innerStart.y} Z`}
              fill={item.color}
              opacity="0.85"
            />
          );
        })}
        <text x="50" y="53" textAnchor="middle" fontSize="11" fill="#9ca3af" fontFamily="JetBrains Mono">{total.toLocaleString()}</text>
      </svg>
    </div>
  );
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboard()
      .then(setDashboard)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)));
  }, []);

  const view = useMemo(() => (dashboard ? toDashboardViewModel(dashboard) : null), [dashboard]);

  if (error) return <ErrorState message={error} />;
  if (!dashboard || !view) return <LoadingState />;

  const maxComponent = Math.max(...view.componentBars.map((item) => item.count), 1);

  return (
    <div className="screen-scroll scrollbar-hide">
      <div className="screen-inner">
        <div className="grid-2">
          <div className="stat-card">
            <div className="stat-head">
              <Activity size={14} />
              <Link className="view-link" to="/logs">전체 보기 <ChevronRight size={9} /></Link>
            </div>
            <strong className="stat-value">{dashboard.stats.totalLogCount.toLocaleString()}</strong>
            <p className="stat-label">최근 24시간 총 로그</p>
            <p className="stat-sub">분석 완료 {dashboard.stats.analyzedLogCount.toLocaleString()}건</p>
          </div>
          <div className="stat-card danger">
            <div className="stat-head">
              <AlertTriangle size={14} />
              <span className="mini-dot" />
            </div>
            <strong className="stat-value">{dashboard.stats.cautionLogCount.toLocaleString()}</strong>
            <p className="stat-label">최근 24시간 주의 로그</p>
            <p className="stat-sub">라벨 기준 이상 로그 · 확인 필요</p>
          </div>
        </div>

        <div className="grid-3 mt-3">
          <div className="ui-card span-2">
            <div className="card-head">
              <p className="card-title">시간대별 로그 발생량</p>
              <div className="legend">
                <span><i className="bg-primary" />전체</span>
                <span><i className="bg-danger" />주의</span>
                <span>최근 24시간</span>
              </div>
            </div>
            <AreaChart data={view.timeSeries} />
          </div>

          <div className="ui-card">
            <p className="card-title">위험도 분포</p>
            <DonutChart data={view.riskDistribution} />
            <div className="risk-list">
              {view.riskDistribution.map((item) => (
                <div className="risk-row" key={item.riskLevel}>
                  <span><i style={{ background: item.color }} />{item.riskLevel}</span>
                  <strong>{item.count.toLocaleString()}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid-3 mt-3">
          <div className="ui-card">
            <p className="card-title">컴포넌트별 로그 수 (24h)</p>
            <div className="bar-list">
              {view.componentBars.slice(0, 4).map((item) => (
                <div className="bar-row" key={item.component}>
                  <span>{item.component}</span>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${(item.count / maxComponent) * 100}%` }} /></div>
                  <strong>{item.count.toLocaleString()}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="ui-card">
            <div className="card-head">
              <p className="card-title">최근 24시간 주의 로그</p>
              <Link className="view-link" to="/analyses">전체 보기 <ChevronRight size={9} /></Link>
            </div>
            <div className="mini-list">
              {dashboard.recentCautionLogs.slice(0, 4).map((log) => (
                <div className="mini-row" key={log.logId}>
                  <span className="mini-dot" />
                  <div className="truncate">
                    <p>{log.content}</p>
                    <small><span>{log.node}</span><span>{log.label}</span><span>{log.logLevel}</span></small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ui-card">
            <div className="card-head">
              <p className="card-title">반복 탐지 패턴</p>
              <Link className="view-link" to="/patterns">전체 보기 <ChevronRight size={9} /></Link>
            </div>
            <div className="mini-list">
              {dashboard.recentPatterns.slice(0, 4).map((pattern) => (
                <div className="mini-row" key={pattern.patternId}>
                  <TrendingUp size={10} className={`mt-0.5 shrink-0 ${riskToneClassOf(pattern.riskLevel)}`} />
                  <div className="truncate">
                    <p>{pattern.patternName}</p>
                    <small><span>{pattern.count.toLocaleString()}건</span><span>{pattern.riskLevel}</span></small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

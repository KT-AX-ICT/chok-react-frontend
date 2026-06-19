import { Activity, AlertTriangle, ChevronRight, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDashboardSummary } from "../api/dashboard";
import { listPatterns } from "../api/patterns";
import { ErrorState } from "../components/common/ErrorState";
import { LoadingState } from "../components/common/LoadingState";
import { riskMeta } from "../domain/constants";
import type { DashboardSummary, RiskLevel } from "../domain/analyses/types";
import type { PatternSummary } from "../domain/patterns/types";

const riskColors: Record<RiskLevel, string> = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#f59e0b",
  LOW: "#10b981",
};

const riskTextClass: Record<RiskLevel, string> = {
  CRITICAL: "text-danger",
  HIGH: "text-orange",
  MEDIUM: "text-warning",
  LOW: "text-success",
};

function AreaChart({ data }: { data: DashboardSummary["hourlyCounts"] }) {
  const width = 600;
  const height = 120;
  const pad = { top: 8, right: 8, bottom: 24, left: 32 };
  const chartWidth = width - pad.left - pad.right;
  const chartHeight = height - pad.top - pad.bottom;
  const max = Math.max(...data.map((item) => item.total), 1);
  const xs = data.map((_, index) => pad.left + (index / Math.max(data.length - 1, 1)) * chartWidth);
  const totalY = data.map((item) => pad.top + chartHeight - (item.total / max) * chartHeight);
  const anomalyY = data.map((item) => pad.top + chartHeight - (item.anomaly / max) * chartHeight);
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
        <linearGradient id="anomaly-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((tick) => (
        <line key={tick} x1={pad.left} x2={width - pad.right} y1={pad.top + chartHeight * (1 - tick)} y2={pad.top + chartHeight * (1 - tick)} stroke="#ffffff" strokeOpacity="0.04" />
      ))}
      <polygon points={area(totalY)} fill="url(#total-gradient)" />
      <polygon points={area(anomalyY)} fill="url(#anomaly-gradient)" />
      <polyline points={polyline(totalY)} fill="none" stroke="#00c8e8" strokeWidth="1.5" strokeLinejoin="round" />
      <polyline points={polyline(anomalyY)} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round" />
      {data.map((item, index) => index % 2 === 0 && (
        <text key={item.hour} x={xs[index]} y={height - 4} textAnchor="middle" fontSize="8" fill="#374151" fontFamily="JetBrains Mono">{item.hour}</text>
      ))}
    </svg>
  );
}

function DonutChart({ counts }: { counts: Record<RiskLevel, number> }) {
  const data = (Object.keys(riskColors) as RiskLevel[]).map((key) => ({ key, value: counts[key] ?? 0, color: riskColors[key] }));
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulative = 0;
  const toXY = (deg: number, radius: number) => {
    const rad = (deg - 90) * (Math.PI / 180);
    return { x: 50 + radius * Math.cos(rad), y: 50 + radius * Math.sin(rad) };
  };

  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 100 100" width="100" height="100">
        {data.map((item) => {
          if (total === 0 || item.value === 0) return null;
          const start = (cumulative / total) * 360;
          cumulative += item.value;
          const end = (cumulative / total) * 360;
          const large = end - start > 180 ? 1 : 0;
          const outerStart = toXY(start, 38);
          const outerEnd = toXY(end, 38);
          const innerStart = toXY(start, 26);
          const innerEnd = toXY(end, 26);
          return (
            <path
              key={item.key}
              d={`M ${outerStart.x} ${outerStart.y} A 38 38 0 ${large} 1 ${outerEnd.x} ${outerEnd.y} L ${innerEnd.x} ${innerEnd.y} A 26 26 0 ${large} 0 ${innerStart.x} ${innerStart.y} Z`}
              fill={item.color}
              opacity="0.85"
            />
          );
        })}
        <text x="50" y="53" textAnchor="middle" fontSize="11" fill="#9ca3af" fontFamily="JetBrains Mono">{total}</text>
      </svg>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [patterns, setPatterns] = useState<PatternSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getDashboardSummary(), listPatterns()])
      .then(([dashboard, patternList]) => {
        setSummary(dashboard);
        setPatterns(patternList);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)));
  }, []);

  const riskCounts = useMemo(() => {
    const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 } as Record<RiskLevel, number>;
    summary?.recentAnalyses.forEach((item) => {
      counts[item.riskLevel] += 1;
    });
    return counts;
  }, [summary]);

  if (error) return <ErrorState message={error} />;
  if (!summary) return <LoadingState />;

  const maxPattern = Math.max(...patterns.map((pattern) => pattern.occurrences), 1);

  return (
    <div className="screen-scroll scrollbar-hide">
      <div className="screen-inner">
        <div className="grid-2">
          <div className="stat-card">
            <div className="stat-head">
              <Activity size={14} />
              <button className="view-link" onClick={() => navigate("/logs")}>전체 보기 <ChevronRight size={9} /></button>
            </div>
            <strong className="stat-value">{summary.totalLogs.toLocaleString()}</strong>
            <p className="stat-label">최근 24시간 총 로그</p>
            <p className="stat-sub">저장 로그 기준 집계</p>
          </div>
          <div className="stat-card danger">
            <div className="stat-head">
              <AlertTriangle size={14} />
              <span className="mini-dot" />
            </div>
            <strong className="stat-value">{summary.anomalyLogs.toLocaleString()}</strong>
            <p className="stat-label">최근 24시간 주의 로그</p>
            <p className="stat-sub">AI 분석 완료 · 즉시 확인 필요</p>
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
            <AreaChart data={summary.hourlyCounts} />
          </div>

          <div className="ui-card">
            <p className="card-title">주의 로그 위험도 분포</p>
            <DonutChart counts={riskCounts} />
            <div className="risk-list">
              {(Object.keys(riskColors) as RiskLevel[]).map((level) => (
                <div className="risk-row" key={level}>
                  <span><i style={{ background: riskColors[level] }} />{riskMeta[level].label}</span>
                  <strong>{riskCounts[level]}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid-3 mt-3">
          <div className="ui-card">
            <p className="card-title">컴포넌트별 로그 수 (24h)</p>
            <div className="bar-list">
              {patterns.slice(0, 4).map((pattern) => (
                <div className="bar-row" key={pattern.id}>
                  <span>{pattern.id}</span>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${(pattern.occurrences / maxPattern) * 100}%` }} /></div>
                  <strong>{pattern.occurrences}</strong>
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
              {summary.recentAnalyses.slice(0, 4).map((analysis) => (
                <Link className="mini-row" to={`/analyses/${analysis.id}`} key={analysis.id}>
                  <span className="mini-dot" />
                  <div className="truncate">
                    <p>{analysis.reason}</p>
                    <small><span>{analysis.node}</span><span className={riskTextClass[analysis.riskLevel]}>{riskMeta[analysis.riskLevel].label}</span></small>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="ui-card">
            <div className="card-head">
              <p className="card-title">반복 탐지 패턴</p>
              <Link className="view-link" to="/patterns">전체 보기 <ChevronRight size={9} /></Link>
            </div>
            <div className="mini-list">
              {patterns.slice(0, 4).map((pattern) => (
                <div className="mini-row" key={pattern.id}>
                  <TrendingUp size={10} className={`mt-0.5 shrink-0 ${riskTextClass[pattern.riskLevel]}`} />
                  <div className="truncate">
                    <p>{pattern.title}</p>
                    <small><span>{pattern.occurrences.toLocaleString()}건</span></small>
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

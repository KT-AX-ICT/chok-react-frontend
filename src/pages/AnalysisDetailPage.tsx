import { ArrowLeft, Brain, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLogDetail } from "../api/logs";
import { getApiErrorMessage } from "../api/client";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import { EmptyState } from "../components/common/EmptyState";
import { RiskBadge } from "../components/domain/RiskBadge";
import { logStatus, type LogStatus } from "../domain/constants";
import type { LogDetail } from "../domain/log/types";

// 상세 헤더 상태 배지 — logStatus 4-state(SSOT)와 1:1. StatusDot의 statusMeta와 의미 일치.
const statusMeta: Record<LogStatus, { label: string; tone: string }> = {
  none: { label: "분석 대상 아님", tone: "muted" },
  pending: { label: "분석 전", tone: "muted" },
  normal: { label: "정상", tone: "success" },
  abnormal: { label: "이상", tone: "danger" },
};

// 분석 상세 화면 — API 명세 §6.2: GET /api/v1/logs/{logId}.
// 응답 LogDetail = 원시 로그 + AI 분석(없으면 null) + 매핑 패턴(없으면 null).
export default function AnalysisDetailPage() {
  const { logId } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<LogDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = Number(logId);
    if (!Number.isFinite(id)) {
      setError("로그 ID가 올바르지 않습니다.");
      return;
    }

    setError(null);
    setDetail(null);
    getLogDetail(id)
      .then(setDetail)
      .catch((err: unknown) => setError(getApiErrorMessage(err)));
  }, [logId]);

  if (error) return <ErrorState message={error} />;
  if (!detail) return <LoadingState />;

  const { log, analysis, pattern } = detail;
  const status = logStatus(log);
  const statusInfo = statusMeta[status];

  return (
    <div className="detail-page">
      <div className="page-header justify-start">
        <button type="button" className="detail-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} />
          <span>뒤로</span>
        </button>
        <span className="font-mono text-xs text-faint">/</span>
        <span className="font-mono text-xs text-text-main">LOG #{log.logId}</span>
        <span className={`badge ${statusInfo.tone} ml-auto`}>{statusInfo.label}</span>
      </div>

      <div className="detail-content scrollbar-hide">
        <div className="detail-stack">
          <div className="detail-card">
            <p className="card-title">원본 로그</p>
            <dl className="detail-kv">
              <dt>Node</dt><dd>{log.node}</dd>
              <dt>Time</dt><dd>{log.occurredAt}</dd>
              <dt>Component</dt><dd>{log.component}</dd>
              <dt>Type</dt><dd>{log.logType}</dd>
              <dt>Level</dt><dd><span className="badge muted">{log.logLevel}</span></dd>
              <dt>Content</dt><dd>{log.content}</dd>
            </dl>
          </div>

          {pattern && (
            <div className="detail-card primary">
              <p className="card-title">패턴 클러스터</p>
              <div className="inline-head mb-2 justify-start">
                <span className="tone-chip bg-primary/10 text-primary">#{pattern.patternId}</span>
                <strong>{pattern.patternName}</strong>
              </div>
              <p className="long-text text-xs">{pattern.representativeLog}</p>
            </div>
          )}

          {analysis ? (
            <>
              <div className="detail-card">
                <div className="inline-head mb-3 justify-start">
                  <Brain size={13} className="text-primary" />
                  <p className="card-title m-0">위험도 · AI 요약</p>
                </div>
                <RiskBadge value={analysis.riskLevel} />
                <p className="long-text mt-3 text-[15px]">{analysis.aiSummary}</p>
              </div>

              <div className="detail-card">
                <div className="inline-head mb-3 justify-start">
                  <Brain size={13} className="text-primary" />
                  <p className="card-title m-0">로그 내용 분석</p>
                </div>
                <p className="long-text">{analysis.analysis}</p>
              </div>

              <div className="detail-card primary">
                <div className="inline-head mb-1 justify-start">
                  <CheckCircle size={13} className="text-primary" />
                  <p className="card-title m-0">권고 조치 (참고용)</p>
                </div>
                <p className="mb-3 text-[13px] text-muted">
                  AI가 제시하는 참고 권고이며, 실제 조치 여부는 담당자가 판단합니다.
                </p>
                <ol className="response-plan long-text">
                  {analysis.responsePlan.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            </>
          ) : status === "none" ? (
            // 비FATAL = BGL 1열 정상 → AI 분석 대상이 아님
            <div className="detail-card">
              <EmptyState message="분석 대상이 아닙니다. (정상 로그)" />
            </div>
          ) : status === "normal" ? (
            // FATAL이지만 2차 분석이 정상 판정 → riskLevel null로 analysis=null (분석 중 아님)
            <div className="detail-card">
              <EmptyState message="분석 결과: 정상 — 이상 징후가 발견되지 않았습니다." />
            </div>
          ) : (
            // FATAL·분석 전(pending) — 명세 §6.2: analysis=null
            <div className="detail-card">
              <EmptyState message="아직 분석 결과가 없습니다 (분석 전 또는 분석 중)." />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

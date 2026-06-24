import { ArrowLeft, Brain, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLogDetail } from "../api/logs";
import { getApiErrorMessage } from "../api/client";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import { EmptyState } from "../components/common/EmptyState";
import { RiskBadge } from "../components/domain/RiskBadge";
import type { LogDetail } from "../domain/log/types";

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

  return (
    <div className="detail-page">
      <div className="page-header justify-start">
        <button type="button" className="detail-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} />
          <span>뒤로</span>
        </button>
        <span className="font-mono text-xs text-faint">/</span>
        <span className="font-mono text-xs text-text-main">LOG #{log.logId}</span>
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
                <div className="inline-head mb-3 justify-start">
                  <CheckCircle size={13} className="text-primary" />
                  <p className="card-title m-0">대응 방안</p>
                </div>
                <ol className="response-plan long-text">
                  {analysis.responsePlan.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            </>
          ) : (
            // 분석 결과가 아직 없는 로그(분석 전/분석 중) — 명세 §6.2: analysis=null
            <div className="detail-card">
              <EmptyState message="아직 분석 결과가 없습니다 (분석 전 또는 분석 중)." />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

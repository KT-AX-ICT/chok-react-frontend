import { ArrowLeft, Brain, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAnalysisDetail } from "../api/analyses";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import { LabelBadge } from "../components/domain/LabelBadge";
import { LevelBadge } from "../components/domain/LevelBadge";
import { RiskBadge } from "../components/domain/RiskBadge";
import type { AnalysisDetail } from "../domain/analyses/types";

export default function AnalysisDetailPage() {
  const { analysisId } = useParams();
  const [detail, setDetail] = useState<AnalysisDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = Number(analysisId);
    if (!Number.isFinite(id)) {
      setError("분석 ID가 올바르지 않습니다.");
      return;
    }

    getAnalysisDetail(id)
      .then(setDetail)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)));
  }, [analysisId]);

  if (error) return <ErrorState message={error} />;
  if (!detail) return <LoadingState />;

  return (
    <div className="detail-page">
      <div className="page-header justify-start">
        <Link className="detail-back" to="/analyses">
          <ArrowLeft size={14} />
          <span>주의 로그 분석</span>
        </Link>
        <span className="font-mono text-xs text-faint">/</span>
        <span className="font-mono text-xs text-text-main">LOG #{detail.log.lineNumber}</span>
        <LabelBadge value={detail.label} />
      </div>

      <div className="detail-content scrollbar-hide">
        <div className="detail-stack">
          <div className="detail-card">
            <p className="card-title">원본 로그</p>
            <dl className="detail-kv">
              <dt>Node</dt><dd>{detail.log.node}</dd>
              <dt>Time</dt><dd>{detail.log.timestamp}</dd>
              <dt>Component</dt><dd>{detail.log.component}</dd>
              <dt>Level</dt><dd><LevelBadge value={detail.log.level} /></dd>
              <dt>EventId</dt><dd>{detail.log.eventId}</dd>
              <dt>Content</dt><dd>{detail.log.message}</dd>
              <dt>Template</dt><dd>{detail.log.eventTemplate}</dd>
            </dl>
          </div>

          {detail.relatedPattern && (
            <div className="detail-card primary">
              <p className="card-title">패턴 클러스터</p>
              <div className="inline-head mb-2 justify-start">
                <span className="tone-chip bg-primary/10 text-primary">{detail.relatedPattern.id}</span>
                <strong>{detail.relatedPattern.title}</strong>
              </div>
              <p className="long-text text-xs">{detail.relatedPattern.description}</p>
            </div>
          )}

          <div className="detail-card">
            <div className="inline-head mb-3 justify-start">
              <Brain size={13} className="text-primary" />
              <p className="card-title m-0">위험도</p>
            </div>
            <RiskBadge value={detail.riskLevel} />
            <p className="long-text mt-3 text-[13px]">{detail.reason}</p>
          </div>

          <div className="detail-card">
            <div className="inline-head mb-3 justify-start">
              <Brain size={13} className="text-primary" />
              <p className="card-title m-0">로그 내용 분석</p>
            </div>
            <p className="long-text">{detail.contentAnalysis}</p>
          </div>

          <div className="detail-card primary">
            <div className="inline-head mb-3 justify-start">
              <CheckCircle size={13} className="text-primary" />
              <p className="card-title m-0">대응 방안</p>
            </div>
            <p className="long-text pre-line">{detail.responseAction}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

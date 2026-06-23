import { ArrowLeft, Brain, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAnalysisDetail } from "../api/analyses";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import { LabelBadge } from "../components/domain/LabelBadge";
import { RiskBadge } from "../components/domain/RiskBadge";
import type { AnalysisDetail } from "../domain/analyses/types";

// 패턴 클러스터 미분류 번호(백엔드 LogAnalysis.clusterId 기본값).
const UNCLUSTERED = 99;

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

  const hasCluster = detail.clusterId !== undefined && detail.clusterId !== UNCLUSTERED;

  return (
    <div className="detail-page">
      <div className="page-header justify-start">
        <Link className="detail-back" to="/analyses">
          <ArrowLeft size={14} />
          <span>주의 로그 분석</span>
        </Link>
        <span className="font-mono text-xs text-faint">/</span>
        <span className="font-mono text-xs text-text-main">LOG #{detail.log.logId}</span>
        <LabelBadge value={detail.log.label} />
      </div>

      <div className="detail-content scrollbar-hide">
        <div className="detail-stack">
          <div className="detail-card">
            <p className="card-title">원본 로그</p>
            <dl className="detail-kv">
              <dt>Node</dt><dd>{detail.log.node}</dd>
              <dt>Time</dt><dd>{detail.log.occurredAt}</dd>
              <dt>Component</dt><dd>{detail.log.component}</dd>
              <dt>Type</dt><dd>{detail.log.logType}</dd>
              <dt>Level</dt><dd><span className="badge muted">{detail.log.logLevel}</span></dd>
              <dt>Content</dt><dd>{detail.log.content}</dd>
            </dl>
          </div>

          {hasCluster && (
            <div className="detail-card primary">
              <p className="card-title">패턴 클러스터</p>
              <div className="inline-head mb-2 justify-start">
                <span className="tone-chip bg-primary/10 text-primary">#{detail.clusterId}</span>
                <strong>패턴 클러스터 {detail.clusterId}</strong>
              </div>
              <p className="long-text text-xs">
                동일 패턴(클러스터 #{detail.clusterId})으로 분류된 로그입니다.
              </p>
            </div>
          )}

          <div className="detail-card">
            <div className="inline-head mb-3 justify-start">
              <Brain size={13} className="text-primary" />
              <p className="card-title m-0">위험도 · AI 요약</p>
            </div>
            <RiskBadge value={detail.riskLevel} />
            <p className="long-text mt-3 text-[13px]">{detail.aiSummary}</p>
          </div>

          <div className="detail-card">
            <div className="inline-head mb-3 justify-start">
              <Brain size={13} className="text-primary" />
              <p className="card-title m-0">로그 내용 분석</p>
            </div>
            <p className="long-text">{detail.analysis}</p>
          </div>

          <div className="detail-card primary">
            <div className="inline-head mb-3 justify-start">
              <CheckCircle size={13} className="text-primary" />
              <p className="card-title m-0">대응 방안</p>
            </div>
            <ol className="response-plan long-text">
              {detail.responsePlan.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

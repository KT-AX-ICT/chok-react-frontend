// 위험도(riskLevel) 표기 SSOT.
// 백엔드(FastAPI 산출 → Spring 저장/전달)가 한글 값을 그대로 내려준다.
// PROJECT_CONTEXT API 공통 규약: 긴급 / 높음 / 보통 / 낮음
export type RiskLevel = "긴급" | "높음" | "보통" | "낮음";

// 위험도 정렬 순서(긴급이 가장 위험). 렌더/정렬 기준.
export const RISK_ORDER: RiskLevel[] = ["긴급", "높음", "보통", "낮음"];

export const riskColor: Record<RiskLevel, string> = {
  긴급: "#ef4444",
  높음: "#f97316",
  보통: "#f59e0b",
  낮음: "#10b981",
};

export const riskToneClass: Record<RiskLevel, string> = {
  긴급: "text-danger",
  높음: "text-orange",
  보통: "text-warning",
  낮음: "text-success",
};

function isKnownRisk(level: string): level is RiskLevel {
  return (RISK_ORDER as string[]).includes(level);
}

// 알 수 없는 값은 중립색/뮤트로 폴백(미분류 등 백엔드 신규 값 방어).
export function riskColorOf(level: string): string {
  return isKnownRisk(level) ? riskColor[level] : "#6b7280";
}

export function riskToneClassOf(level: string): string {
  return isKnownRisk(level) ? riskToneClass[level] : "text-muted";
}

// 정렬용 서수(긴급=0 … 낮음=3). 미지정 값은 뒤로 보낸다.
export function riskOrderOf(level: string): number {
  const idx = (RISK_ORDER as string[]).indexOf(level);
  return idx === -1 ? RISK_ORDER.length : idx;
}

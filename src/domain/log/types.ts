// Spring ENUM logLevel: INFO / WARNING / ERROR / FATAL / SEVERE / FAILURE (API 공통 규약)
export type LogLevel = "INFO" | "WARNING" | "ERROR" | "FATAL" | "SEVERE" | "FAILURE";

// 백엔드 `LogSummary`(SSOT)와 1:1 매핑.
// GET /api/v1/logs 응답 PageResponse<LogSummary>.content 의 원소 타입.
export interface LogEntry {
  logId: number;
  occurredAt: string; // 발생 시각(YYYY-MM-DD HH:mm:ss). 구 timestamp 대체.
  node: string;
  component: string;
  logType: string;
  logLevel: LogLevel; // 구 level 대체.
  label: string; // BGL 라벨. '-'이면 정상(검증 답지).
  isCaution: boolean; // 백엔드 파생값: label !== '-'.
  isAnalysis: boolean; // 백엔드 파생값: 해당 로그에 분석결과 존재 여부.
  content: string; // 로그 본문. 구 message 대체.
  riskLevel: string | null; // 미분석이면 null. 한글(긴급/높음/보통/낮음). 표기 SSOT=domain/risk.ts.
  // NOTE: 백엔드 LogSummary에 eventId/eventTemplate/lineNumber 필드는 없음(제거됨).
  //       표 # 컬럼은 화면에서 인덱스로 파생 처리한다.
}

// 화면이 쓰기 쉽게 정리한 목록 응답 형태.
// PageResponse<LogSummary> 를 items/total + 페이지 메타로 평탄화.
export interface LogListResponse {
  items: LogEntry[];
  total: number; // = PageResponse.totalElements
  page: number; // 0-base (PageResponse.page)
  size: number;
  totalPages: number;
}

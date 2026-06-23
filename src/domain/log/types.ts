export type LogLevel = "INFO" | "FATAL" | "ERROR" | "WARNING" | "SEVERE";

export interface LogEntry {
  id: number;
  lineNumber: number;
  node: string;
  timestamp: string;
  component: string;
  level: LogLevel;
  eventId: string;
  message: string;
  eventTemplate: string;
  // 정상/이상 판정: 추후 API의 is_abnormal 응답을 매핑. 미제공 시 level === "FATAL"로 대체(isAbnormalLog).
  isAbnormal?: boolean;
}

export interface LogListResponse {
  items: LogEntry[];
  total: number;
}

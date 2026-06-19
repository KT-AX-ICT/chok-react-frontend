export type LogLevel = "INFO" | "WARN" | "ERROR" | "FATAL" | "DEBUG";

export interface LogEntry {
  id: number;
  lineNumber: number;
  label: string;
  node: string;
  timestamp: string;
  component: string;
  level: LogLevel;
  eventId: string;
  message: string;
  eventTemplate: string;
}

export interface LogListResponse {
  items: LogEntry[];
  total: number;
}

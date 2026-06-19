import { apiClient, readData, USE_MOCKS } from "./client";
import type { LogEntry, LogListResponse } from "../domain/log/types";
import { mockLogs } from "../mocks/logs";

export interface LogQuery {
  label?: string;
  level?: string;
  keyword?: string;
}

export async function listLogs(query: LogQuery = {}): Promise<LogListResponse> {
  if (USE_MOCKS) {
    const keyword = query.keyword?.trim().toLowerCase();
    const items = mockLogs
      .filter((log) => !query.label || query.label === "ALL" || log.label === query.label)
      .filter((log) => !query.level || query.level === "ALL" || log.level === query.level)
      .filter((log) => {
        if (!keyword) return true;
        return [log.node, log.component, log.eventId, log.message].some((value) =>
          value.toLowerCase().includes(keyword)
        );
      });
    return readData({ items, total: items.length });
  }

  const { data } = await apiClient.get<LogListResponse>("/api/logs", { params: query });
  return data;
}

export async function getLog(logId: number): Promise<LogEntry> {
  if (USE_MOCKS) {
    const log = mockLogs.find((item) => item.id === logId);
    if (!log) throw new Error(`Log ${logId} not found`);
    return readData(log);
  }

  const { data } = await apiClient.get<LogEntry>(`/api/logs/${logId}`);
  return data;
}

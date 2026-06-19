import { apiClient, readData, USE_MOCKS } from "./client";
import type { PatternSummary } from "../domain/patterns/types";
import { mockPatterns } from "../mocks/patterns";

export async function listPatterns(): Promise<PatternSummary[]> {
  if (USE_MOCKS) return readData(mockPatterns);
  const { data } = await apiClient.get<PatternSummary[]>("/api/patterns");
  return data;
}

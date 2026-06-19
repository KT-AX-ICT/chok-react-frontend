import { apiClient, readData, USE_MOCKS } from "./client";
import type { AnalysisDetail, AnalysisSummary } from "../domain/analyses/types";
import { mockAnalyses, mockAnalysisDetails } from "../mocks/analyses";

export interface AnalysisQuery {
  riskLevel?: string;
  keyword?: string;
}

export async function listAnalyses(query: AnalysisQuery = {}): Promise<AnalysisSummary[]> {
  if (USE_MOCKS) {
    const keyword = query.keyword?.trim().toLowerCase();
    const items = mockAnalyses
      .filter((item) => !query.riskLevel || query.riskLevel === "ALL" || item.riskLevel === query.riskLevel)
      .filter((item) => {
        if (!keyword) return true;
        return [item.label, item.node, item.reason].some((value) => value.toLowerCase().includes(keyword));
      });
    return readData(items);
  }

  const { data } = await apiClient.get<AnalysisSummary[]>("/api/analyses", { params: query });
  return data;
}

export async function getAnalysisDetail(analysisId: number): Promise<AnalysisDetail> {
  if (USE_MOCKS) {
    const analysis = mockAnalysisDetails.find((item) => item.id === analysisId);
    if (!analysis) throw new Error(`Analysis ${analysisId} not found`);
    return readData(analysis);
  }

  const { data } = await apiClient.get<AnalysisDetail>(`/api/analyses/${analysisId}`);
  return data;
}

import axios from "axios";

// dev에선 상대경로("") → vite proxy(/api → :8080)로 same-origin 중계(CORS 불필요).
// 배포/원격 직접 호출 시에만 VITE_API_BASE_URL로 호스트를 지정한다.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60_000,
  headers: { "Content-Type": "application/json" },
});

export function readData<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

/** Spring `global.dto.PageResponse<T>`와 1:1. 목록 API 공통 페이지네이션 래퍼. */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

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

/** 공통 에러 포맷(API 명세 §4). 백엔드가 4xx/5xx 시 body로 내려준다. */
export interface ApiError {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  path: string;
}

/**
 * 화면에 보여줄 에러 메시지를 추출한다.
 * 우선순위: 백엔드 ApiError.message → 네트워크 오류 안내 → Error.message → fallback.
 */
export function getApiErrorMessage(err: unknown, fallback = "요청을 처리하지 못했습니다."): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as Partial<ApiError> | undefined;
    if (data?.message) return data.message;
    if (err.code === "ERR_NETWORK") return "서버에 연결할 수 없습니다. 백엔드 상태를 확인해 주세요.";
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

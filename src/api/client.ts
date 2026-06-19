import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60_000,
  headers: { "Content-Type": "application/json" },
});

export function readData<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

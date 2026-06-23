import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // 모든 인터페이스(0.0.0.0)에 바인딩 — 원격(Tailscale) 접속 허용
    port: 5173,
    strictPort: false,
    allowedHosts: true, // Host 헤더 검증 생략 — dev 한정
    // same-origin(/api) 호출을 Spring으로 중계 → CORS 불필요
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
});

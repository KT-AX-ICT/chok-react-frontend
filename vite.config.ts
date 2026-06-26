import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    // 백엔드 OAuth2 콜백(http://localhost:5173/oauth/callback)이 5173 고정이므로
    // 포트가 점유되면 조용히 다른 포트로 넘어가지 않고 즉시 에러를 냅니다.
    strictPort: true,
  },
});

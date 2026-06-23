import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";

// 렌더 전 저장된 테마를 선반영해 라이트↔다크 깜빡임(FOUC) 방지. 출처는 ThemeToggle과 동일한 localStorage 'theme'.
document.documentElement.setAttribute(
  "data-theme",
  localStorage.getItem("theme") === "light" ? "light" : "dark",
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

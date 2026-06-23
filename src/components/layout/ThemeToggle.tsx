import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "dark" | "light";

// localStorage 'theme' 단일 출처. main.tsx에서 렌더 전 동일 키로 data-theme를 선반영해 FOUC를 막는다.
function getInitialTheme(): Theme {
  return localStorage.getItem("theme") === "light" ? "light" : "dark";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
    >
      {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
      <span>{theme === "dark" ? "LIGHT" : "DARK"}</span>
    </button>
  );
}

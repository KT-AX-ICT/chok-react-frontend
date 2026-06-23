import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import DashboardPage from "./pages/DashboardPage";
import LogsPage from "./pages/LogsPage";
import AnalysesPage from "./pages/AnalysesPage";
import AnalysisDetailPage from "./pages/AnalysisDetailPage";
import PatternsPage from "./pages/PatternsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/logs" element={<LogsPage />} />
        <Route path="/analyses" element={<AnalysesPage />} />
        <Route path="/analyses/:logId" element={<AnalysisDetailPage />} />
        <Route path="/patterns" element={<PatternsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

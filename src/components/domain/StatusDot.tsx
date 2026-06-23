interface StatusDotProps {
  abnormal: boolean;
}

export function StatusDot({ abnormal }: StatusDotProps) {
  return <span className={`status-dot ${abnormal ? "danger" : "success"}`} title={abnormal ? "이상 로그" : "정상 로그"} />;
}

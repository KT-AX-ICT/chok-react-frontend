interface EmptyStateProps {
  message?: string;
}

// 데이터가 비어 있을 때 표시하는 공통 상태 컴포넌트(에러 아님).
export function EmptyState({ message = "표시할 데이터가 없습니다." }: EmptyStateProps) {
  return <div className="state-box">{message}</div>;
}

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onChange: (page: number) => void;
}

// 페이지 번호 목록 생성 (양끝 + 현재 주변, 가운데는 … 축약).
function pageList(page: number, totalPages: number): Array<number | "…"> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: Array<number | "…"> = [1];
  if (page > 3) pages.push("…");
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
  if (page < totalPages - 2) pages.push("…");
  pages.push(totalPages);
  return pages;
}

export function Pagination({ page, totalPages, totalItems, pageSize, onChange }: PaginationProps) {
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);
  const atFirst = page <= 1;
  const atLast = page >= totalPages || totalPages === 0;

  return (
    <div className="pagination">
      <div className="pagination-controls">
        <button className="pagination-btn" type="button" disabled={atFirst} onClick={() => onChange(1)}>
          <ChevronsLeft size={15} />
        </button>
        <button className="pagination-btn" type="button" disabled={atFirst} onClick={() => onChange(page - 1)}>
          <ChevronLeft size={15} />
        </button>
        {pageList(page, totalPages).map((p, index) =>
          p === "…" ? (
            <span key={`ellipsis-${index}`} className="pagination-ellipsis">…</span>
          ) : (
            <button
              key={p}
              type="button"
              className={`pagination-page ${p === page ? "active" : ""}`}
              onClick={() => onChange(p)}
            >
              {p}
            </button>
          ),
        )}
        <button className="pagination-btn" type="button" disabled={atLast} onClick={() => onChange(page + 1)}>
          <ChevronRight size={15} />
        </button>
        <button className="pagination-btn" type="button" disabled={atLast} onClick={() => onChange(totalPages)}>
          <ChevronsRight size={15} />
        </button>
      </div>
      <span className="pagination-info">{from}–{to} / 전체 {totalItems}개</span>
    </div>
  );
}

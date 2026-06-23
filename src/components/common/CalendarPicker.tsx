import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CalendarPickerProps {
  value: string; // "YYYY-MM-DD" | ""
  activeDates: Set<string>; // 로그가 있는 날짜(선택 가능 + 점 표시)
  onChange: (date: string) => void;
}

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function CalendarPicker({ value, activeDates, onChange }: CalendarPickerProps) {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(value ? Number(value.slice(0, 4)) : today.getFullYear());
  const [month, setMonth] = useState(value ? Number(value.slice(5, 7)) - 1 : today.getMonth());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // 외부에서 value가 바뀌면 달력 표시 월을 동기화
  useEffect(() => {
    if (value) {
      setYear(Number(value.slice(0, 4)));
      setMonth(Number(value.slice(5, 7)) - 1);
    }
  }, [value]);

  const prevMonth = () => (month === 0 ? (setYear((y) => y - 1), setMonth(11)) : setMonth((m) => m - 1));
  const nextMonth = () => (month === 11 ? (setYear((y) => y + 1), setMonth(0)) : setMonth((m) => m + 1));

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<number | null> = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const fmt = (d: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const label = value
    ? `${value.slice(0, 4)}. ${Number(value.slice(5, 7))}. ${Number(value.slice(8, 10))}.`
    : "날짜 선택";

  return (
    <div ref={ref} className="relative">
      <button type="button" className={`date-toggle ${value ? "active" : ""}`} onClick={() => setOpen((o) => !o)}>
        <CalendarDays size={11} />
        <span>{label}</span>
        {value ? (
          <X size={10} onClick={(e) => { e.stopPropagation(); onChange(""); }} />
        ) : (
          <ChevronRight size={10} className={`transition-transform ${open ? "rotate-90" : ""}`} />
        )}
      </button>

      {open && (
        <div className="calendar-pop">
          <div className="calendar-nav">
            <button type="button" onClick={prevMonth}><ChevronLeft size={13} /></button>
            <span>{year}년 {month + 1}월</span>
            <button type="button" onClick={nextMonth}><ChevronRight size={13} /></button>
          </div>

          <div className="calendar-dow">
            {DAYS.map((d, i) => (
              <span key={d} className={i === 0 ? "sun" : i === 6 ? "sat" : ""}>{d}</span>
            ))}
          </div>

          <div className="calendar-grid">
            {cells.map((day, i) => {
              if (!day) return <span key={`empty-${i}`} />;
              const dateStr = fmt(day);
              const hasLogs = activeDates.has(dateStr);
              const selected = value === dateStr;
              const dow = (firstDay + day - 1) % 7;
              const tone = dow === 0 ? "sun" : dow === 6 ? "sat" : "";
              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={!hasLogs}
                  onClick={() => { onChange(dateStr); setOpen(false); }}
                  className={`calendar-cell ${tone} ${selected ? "selected" : ""} ${hasLogs ? "has-logs" : "empty"}`}
                >
                  {day}
                  {hasLogs && !selected && <i className="calendar-dot" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

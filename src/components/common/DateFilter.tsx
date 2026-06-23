import { CalendarPicker } from "./CalendarPicker";

export interface DateFilterValue {
  selectedDate: string; // "YYYY-MM-DD" | ""
  recent24h: boolean;
}

interface DateFilterProps {
  value: DateFilterValue;
  activeDates: Set<string>;
  onChange: (value: DateFilterValue) => void;
}

// 날짜(하루 00:00~23:59) ↔ 최근 24시간 상호배타.
// 항상 둘 중 하나만 활성 — 날짜를 해제하면 최근 24시간으로 복귀(전체 기간 상태 없음).
export function DateFilter({ value, activeDates, onChange }: DateFilterProps) {
  return (
    <>
      <CalendarPicker
        value={value.selectedDate}
        activeDates={activeDates}
        onChange={(date) => onChange({ selectedDate: date, recent24h: date === "" })}
      />
      <button
        type="button"
        className={`date-toggle ${value.recent24h ? "active" : ""}`}
        onClick={() => onChange({ selectedDate: "", recent24h: true })}
      >
        최근 24시간
      </button>
    </>
  );
}

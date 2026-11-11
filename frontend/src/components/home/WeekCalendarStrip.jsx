import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatWeekRangeLabel, getTodayDateStr, getWeekDays } from '../../utils/date.js';

export function WeekCalendarStrip({
  selectedDate,
  onSelectDate,
  onShiftWeek,
  onJumpToday,
}) {
  const days = getWeekDays(selectedDate);
  const weekLabel = formatWeekRangeLabel(selectedDate);
  const todayStr = getTodayDateStr();
  const isTodaySelected = selectedDate === todayStr;

  return (
    <section className="px-5 pt-3">
      {/* Subtle Week Navigation Bar (Mon - Sun) */}
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-[#6B7280]">{weekLabel}</span>
          {!isTodaySelected && (
            <button
              type="button"
              onClick={onJumpToday}
              className="cursor-pointer rounded-full bg-[#EEF3FF] px-2 py-0.5 text-[11px] font-medium text-[#3D5AF1] transition hover:bg-[#DDE3FF]"
            >
              Today
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onShiftWeek(-1)}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-[#6B7280] transition hover:bg-slate-100 hover:text-[#111827]"
            aria-label="Previous week"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onShiftWeek(1)}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-[#6B7280] transition hover:bg-slate-100 hover:text-[#111827]"
            aria-label="Next week"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 7-Day Horizontal Strip (Mon - Sun) matching Figma */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isSelected = day.dateStr === selectedDate;
          return (
            <button
              key={day.dateStr}
              type="button"
              onClick={() => onSelectDate(day.dateStr)}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-[6px] py-2 transition ${
                isSelected
                  ? 'bg-[#3D5AF1] text-white shadow-[0_4px_12px_rgba(61,90,241,0.3)]'
                  : 'text-[#111827] hover:bg-slate-100/80'
              }`}
            >
              <span
                className={`text-[11px] font-medium ${
                  isSelected ? 'text-white/90' : 'text-[#9CA3AF]'
                }`}
              >
                {day.dayShort}
              </span>
              <span
                className={`mt-1 text-[14px] font-bold ${
                  isSelected ? 'text-white' : 'text-[#111827]'
                }`}
              >
                {day.dayNumber}
              </span>
              <span
                className={`mt-1 h-1 w-1 rounded-full ${
                  isSelected
                    ? 'bg-white'
                    : day.isToday
                      ? 'bg-[#3D5AF1]'
                      : 'bg-transparent'
                }`}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}

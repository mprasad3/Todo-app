import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getWeekDays } from '../../utils/date.js';

export function WeekCalendarStrip({
  selectedDate,
  onSelectDate,
  onShiftWeek,
}) {
  const days = getWeekDays(selectedDate);

  return (
    <section className="px-3 pt-5">
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => onShiftWeek(-1)}
          aria-label="Previous week"
          className="flex h-10 w-5 shrink-0 cursor-pointer items-center justify-center text-[#D1D5DB] transition hover:text-[#6B7280]"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        {/* 7-Day Horizontal Strip (Mon - Sun) matching Figma Image 1 */}
        <div className="grid flex-1 grid-cols-7">
          {days.map((day) => {
            const isSelected = day.dateStr === selectedDate;
            return (
              <div key={day.dateStr} className="flex justify-center">
                <button
                  type="button"
                  onClick={() => onSelectDate(day.dateStr)}
                  className={`flex w-[42px] cursor-pointer flex-col items-center justify-center rounded-none py-2 transition ${
                    isSelected
                      ? 'bg-[#4566EC] text-white'
                      : 'text-[#9CA3AF] hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`text-[11px] font-normal ${
                      isSelected ? 'text-white' : 'text-[#9CA3AF]'
                    }`}
                  >
                    {day.dayShort}
                  </span>
                  <span
                    className={`mt-1.5 text-[13px] font-medium ${
                      isSelected ? 'text-white' : 'text-[#9CA3AF]'
                    }`}
                  >
                    {day.dayNumber}
                  </span>
                  <span
                    className={`mt-1.5 h-1 w-1 rounded-full ${
                      isSelected
                        ? 'bg-white'
                        : day.isToday
                          ? 'bg-[#4566EC]/50'
                          : 'bg-transparent'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onShiftWeek(1)}
          aria-label="Next week"
          className="flex h-10 w-5 shrink-0 cursor-pointer items-center justify-center text-[#D1D5DB] transition hover:text-[#6B7280]"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}

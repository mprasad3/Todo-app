import { SquareCheck, SquareX } from 'lucide-react';
import { formatTwoDigits } from '../../utils/date.js';

export function WeeklySummaryCards({
  summary,
  activeStatusFilter,
  onSelectSummaryCard,
}) {
  const completedCount = formatTwoDigits(summary?.completed);
  const openCount = formatTwoDigits(summary?.open);
  const progressPercent = Math.min(100, Math.max(0, Number(summary?.progressPercent) || 0));

  return (
    <section className="px-6 pt-6">
      {/* 2-Column Summary Cards matching Figma Image 2 */}
      <div className="grid grid-cols-2 gap-4">
        {/* Card 1: Task Complete */}
        <button
          type="button"
          onClick={() => onSelectSummaryCard('completed')}
          className={`flex cursor-pointer flex-col justify-start rounded-none bg-[#EEF2FF] px-3 py-4 text-left transition hover:brightness-[0.98] ${
            activeStatusFilter === 'completed' ? 'ring-2 ring-[#4566EC]' : ''
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-none bg-[#9BB0FF] text-[#1E3A8A]">
              <SquareCheck className="h-[20px] w-[20px] stroke-[1.75]" />
            </span>
            <span className="whitespace-nowrap text-[12px] font-medium text-[#111827]">
              Task Complete
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline gap-1.5 pl-[38px]">
            <span className="text-[21px] leading-none font-bold tracking-tight text-[#0F172A]">
              {completedCount}
            </span>
            <span className="whitespace-nowrap text-[10.5px] font-normal text-[#6B7280]">
              This Week
            </span>
          </div>
        </button>

        {/* Card 2: Task Pending */}
        <button
          type="button"
          onClick={() => onSelectSummaryCard('in_progress')}
          className={`flex cursor-pointer flex-col justify-start rounded-none bg-[#FEECEE] px-3 py-4 text-left transition hover:brightness-[0.98] ${
            activeStatusFilter === 'in_progress' ? 'ring-2 ring-[#EF4444]' : ''
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-none bg-[#FAB3B3] text-[#B91C1C]">
              <SquareX className="h-[20px] w-[20px] stroke-[1.75]" />
            </span>
            <span className="whitespace-nowrap text-[12px] font-medium text-[#111827]">
              Task Pending
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline gap-1.5 pl-[38px]">
            <span className="text-[21px] leading-none font-bold tracking-tight text-[#0F172A]">
              {openCount}
            </span>
            <span className="whitespace-nowrap text-[10.5px] font-normal text-[#6B7280]">
              This Week
            </span>
          </div>
        </button>
      </div>

      {/* Weekly Progress Section matching Figma */}
      <div className="mt-7" title={`Weekly Progress: ${progressPercent}%`}>
        <h2 className="text-[16px] font-bold text-[#111827]">Weekly Progress</h2>

        <div
          className="mt-3 h-[18px] w-full overflow-hidden rounded-none bg-[#D6DCFF]"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-none bg-[#253C98] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </section>
  );
}

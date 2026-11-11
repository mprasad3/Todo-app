import { Check, X } from 'lucide-react';
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
    <section className="px-5 pt-5">
      {/* 2-Column Summary Cards matching Figma */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Card 1: Task Complete */}
        <button
          type="button"
          onClick={() => onSelectSummaryCard('completed')}
          className={`flex cursor-pointer flex-col justify-between rounded-[10px] bg-[#EEF3FF] p-3.5 text-left transition hover:brightness-[0.98] ${
            activeStatusFilter === 'completed' ? 'ring-2 ring-[#3D5AF1]' : ''
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[5px] bg-[#3D5AF1] text-white">
              <Check className="h-3.5 w-3.5 stroke-[2.6]" />
            </span>
            <span className="truncate text-[12px] font-medium text-[#111827]">
              Task Complete
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-[24px] leading-none font-bold tracking-tight text-[#111827]">
              {completedCount}
            </span>
            <span className="text-[11px] font-medium text-[#6B7280]">This Week</span>
          </div>
        </button>

        {/* Card 2: Task Pending */}
        <button
          type="button"
          onClick={() => onSelectSummaryCard('in_progress')}
          className={`flex cursor-pointer flex-col justify-between rounded-[10px] bg-[#FFF0F2] p-3.5 text-left transition hover:brightness-[0.98] ${
            activeStatusFilter === 'in_progress' ? 'ring-2 ring-[#EF4444]' : ''
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[5px] bg-[#EF4444] text-white">
              <X className="h-3.5 w-3.5 stroke-[2.6]" />
            </span>
            <span className="truncate text-[12px] font-medium text-[#111827]">
              Task Pending
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-[24px] leading-none font-bold tracking-tight text-[#111827]">
              {openCount}
            </span>
            <span className="text-[11px] font-medium text-[#6B7280]">This Week</span>
          </div>
        </button>
      </div>

      {/* Weekly Progress Bar Section matching Figma */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-[#111827]">Weekly Progress</h2>
          <span className="text-[12px] font-semibold text-[#3D5AF1]">{progressPercent}%</span>
        </div>

        <div
          className="mt-2.5 h-[16px] w-full overflow-hidden rounded-[4px] bg-[#DDE3FF]"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-[4px] bg-[#2C43A8] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </section>
  );
}

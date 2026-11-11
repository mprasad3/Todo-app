import { useRef, useState } from 'react';
import { Check, SquarePen, Trash2 } from 'lucide-react';
import { extractDateStr, formatDisplayTime } from '../../utils/date.js';

const PRIORITY_STYLES = {
  high: 'border border-red-200 bg-red-50 text-red-600',
  medium: 'border border-yellow-300 bg-yellow-50 text-yellow-700',
  low: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
};

export function TaskItem({
  task,
  showDateBadge = false,
  onToggle,
  onEdit,
  onDelete,
}) {
  const isCompleted = task.status === 'completed';
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const swipingHorizontalRef = useRef(false);

  const SWIPE_OPEN_PX = -72;

  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    swipingHorizontalRef.current = false;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - startXRef.current;
    const dy = e.touches[0].clientY - startYRef.current;

    if (!swipingHorizontalRef.current) {
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
        swipingHorizontalRef.current = true;
      } else if (Math.abs(dy) > 8) {
        setIsDragging(false);
        return;
      }
    }

    if (swipingHorizontalRef.current) {
      const clamped = Math.max(SWIPE_OPEN_PX - 12, Math.min(0, dx));
      setSwipeOffset(clamped);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (swipeOffset < -36) {
      setSwipeOffset(SWIPE_OPEN_PX);
    } else {
      setSwipeOffset(0);
    }
  };

  const timeRange =
    task.startAt || task.endAt
      ? [
          task.startAt ? formatDisplayTime(task.startAt) : '',
          task.endAt ? formatDisplayTime(task.endAt) : '',
        ]
          .filter(Boolean)
          .join(' – ')
      : '';

  const priority = task.priority || 'medium';

  return (
    <div className="relative overflow-hidden border-b border-[#F1F5F9] last:border-b-0">
      {/* Revealed Swipe-Left Delete Drawer */}
      <div className="absolute inset-y-0 right-0 flex w-[72px] items-center justify-center bg-[#EF4444]">
        <button
          type="button"
          onClick={() => onDelete(task._id)}
          className="flex h-full w-full cursor-pointer items-center justify-center text-[12px] font-semibold text-white"
        >
          Delete
        </button>
      </div>

      {/* Foreground Task Row matching Figma Image 1 */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
        className="relative flex items-center justify-between gap-3 bg-white py-3.5"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* Sharp Square Checkbox matching Figma Image 1 */}
          <button
            type="button"
            onClick={() => onToggle(task._id)}
            aria-label={isCompleted ? 'Mark task in progress' : 'Mark task completed'}
            className={`flex h-[18px] w-[18px] shrink-0 cursor-pointer items-center justify-center rounded-none border-[1.25px] transition ${
              isCompleted
                ? 'border-[#6A82FB] bg-[#EEF2FF] text-[#4566EC]'
                : 'border-[#6A82FB] bg-white hover:bg-[#EEF2FF]/60'
            }`}
          >
            {isCompleted && <Check className="h-3 w-3 stroke-[2.5]" />}
          </button>

          {/* Task Title + Compact Time & Priority metadata */}
          <button
            type="button"
            onClick={() => {
              if (swipeOffset < 0) {
                setSwipeOffset(0);
              } else {
                onEdit(task);
              }
            }}
            className="min-w-0 flex-1 cursor-pointer text-left"
          >
            <p
              className={`truncate text-[13.5px] font-medium text-[#111827] ${
                isCompleted ? 'line-through' : ''
              }`}
            >
              {task.title}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              {showDateBadge && (
                <span className="text-[10.5px] text-[#6B7280]">
                  {extractDateStr(task.dueAt)}
                </span>
              )}
              {timeRange && (
                <span className="text-[10.5px] text-[#6B7280]">{timeRange}</span>
              )}
              <span
                className={`rounded-none px-1.5 py-0 text-[10px] font-medium capitalize ${
                  PRIORITY_STYLES[priority] || PRIORITY_STYLES.medium
                }`}
              >
                {priority}
              </span>
            </div>
          </button>
        </div>

        {/* Trailing Action Icons matching Figma Image 1 (Trash + SquarePen) */}
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={() => onDelete(task._id)}
            aria-label={`Delete ${task.title}`}
            className="flex h-7 w-6 cursor-pointer items-center justify-center rounded-none text-[#B0B7C3] transition hover:bg-red-50 hover:text-[#EF4444]"
          >
            <Trash2 className="h-[17px] w-[17px] stroke-[1.6]" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(task)}
            aria-label={`Edit ${task.title}`}
            className="flex h-7 w-6 cursor-pointer items-center justify-center rounded-none text-[#B0B7C3] transition hover:bg-slate-100 hover:text-[#4566EC]"
          >
            <SquarePen className="h-[17px] w-[17px] stroke-[1.6]" />
          </button>
        </div>
      </div>
    </div>
  );
}

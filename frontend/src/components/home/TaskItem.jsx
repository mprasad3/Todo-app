import { useRef, useState } from 'react';
import { Check, Pencil, Trash2 } from 'lucide-react';
import { extractDateStr, formatDisplayTime } from '../../utils/date.js';

const PRIORITY_STYLES = {
  high: 'bg-red-50 text-red-600',
  medium: 'bg-amber-50 text-amber-700',
  low: 'bg-emerald-50 text-emerald-700',
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

  return (
    <div className="relative overflow-hidden border-b border-[#F3F4F6] last:border-b-0">
      {/* Revealed Swipe-Left Delete Drawer (PDF Step 4) */}
      <div className="absolute inset-y-0 right-0 flex w-[72px] items-center justify-center bg-[#EF4444]">
        <button
          type="button"
          onClick={() => onDelete(task._id)}
          className="flex h-full w-full cursor-pointer items-center justify-center text-[12px] font-semibold text-white"
        >
          Delete
        </button>
      </div>

      {/* Foreground Task Row */}
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
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {/* Custom Square Checkbox matching Figma */}
          <button
            type="button"
            onClick={() => onToggle(task._id)}
            aria-label={isCompleted ? 'Mark task in progress' : 'Mark task completed'}
            className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 cursor-pointer items-center justify-center rounded-[4px] border-[1.5px] transition ${
              isCompleted
                ? 'border-[#3D5AF1] bg-[#EEF3FF] text-[#3D5AF1]'
                : 'border-[#6A82FB] bg-white hover:bg-[#EEF3FF]/60'
            }`}
          >
            {isCompleted && <Check className="h-3 w-3 stroke-[2.8]" />}
          </button>

          {/* Task Title + Optional Time / Priority / Date metadata */}
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
              className={`truncate text-[14px] font-medium transition ${
                isCompleted ? 'text-[#9CA3AF] line-through' : 'text-[#111827]'
              }`}
            >
              {task.title}
            </p>
            {(timeRange || showDateBadge || task.priority !== 'medium') && (
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                {showDateBadge && (
                  <span className="text-[11px] text-[#6B7280]">
                    {extractDateStr(task.dueAt)}
                  </span>
                )}
                {timeRange && (
                  <span className="text-[11px] text-[#6B7280]">{timeRange}</span>
                )}
                {task.priority && task.priority !== 'medium' && (
                  <span
                    className={`rounded px-1.5 py-0.2 text-[10px] font-semibold capitalize ${
                      PRIORITY_STYLES[task.priority] || ''
                    }`}
                  >
                    {task.priority}
                  </span>
                )}
              </div>
            )}
          </button>
        </div>

        {/* Trailing Action Icons matching Figma (Trash + Pencil) */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onDelete(task._id)}
            aria-label={`Delete ${task.title}`}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#9CA3AF] transition hover:bg-red-50 hover:text-[#EF4444]"
          >
            <Trash2 className="h-[16px] w-[16px] stroke-[1.75]" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(task)}
            aria-label={`Edit ${task.title}`}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#9CA3AF] transition hover:bg-slate-100 hover:text-[#3D5AF1]"
          >
            <Pencil className="h-[16px] w-[16px] stroke-[1.75]" />
          </button>
        </div>
      </div>
    </div>
  );
}

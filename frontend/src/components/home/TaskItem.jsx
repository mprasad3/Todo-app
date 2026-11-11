import { useEffect, useRef, useState } from 'react';
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
  const [isDeleting, setIsDeleting] = useState(false);

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const swipingHorizontalRef = useRef(false);
  const swipeOffsetRef = useRef(0);
  const isMouseDownRef = useRef(false);
  const hasMovedRef = useRef(false);
  const containerRef = useRef(null);

  // Reveal threshold to show drawer (-80px), full-swipe threshold to auto-delete (-160px)
  const SWIPE_OPEN_PX = -80;
  const SWIPE_DELETE_THRESHOLD = -160;

  const triggerDelete = () => {
    if (isDeleting) return;
    setIsDeleting(true);
    setSwipeOffset(-window.innerWidth);
    swipeOffsetRef.current = -window.innerWidth;
    setTimeout(() => onDelete(task._id), 280);
  };

  // Touch Handlers (Mobile / Responsive)
  const handleTouchStart = (e) => {
    if (isDeleting) return;
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    swipingHorizontalRef.current = false;
    hasMovedRef.current = false;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || isDeleting) return;
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
      hasMovedRef.current = true;
      const clamped = Math.min(0, dx);
      swipeOffsetRef.current = clamped;
      setSwipeOffset(clamped);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (isDeleting) return;

    const currentOffset = swipeOffsetRef.current;
    if (currentOffset <= SWIPE_DELETE_THRESHOLD) {
      triggerDelete();
    } else if (currentOffset < -36) {
      setSwipeOffset(SWIPE_OPEN_PX);
      swipeOffsetRef.current = SWIPE_OPEN_PX;
    } else {
      setSwipeOffset(0);
      swipeOffsetRef.current = 0;
    }

    setTimeout(() => {
      hasMovedRef.current = false;
    }, 60);
  };

  // Mouse Handlers (Desktop View)
  const handleMouseDown = (e) => {
    if (e.button !== 0 || isDeleting) return;
    // Don't drag if clicking buttons directly
    if (e.target.closest('button[data-no-drag="true"]')) return;

    isMouseDownRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    swipingHorizontalRef.current = false;
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isMouseDownRef.current || isDeleting) return;
      const dx = e.clientX - startXRef.current;
      const dy = e.clientY - startYRef.current;

      if (!swipingHorizontalRef.current) {
        if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
          swipingHorizontalRef.current = true;
        } else if (Math.abs(dy) > 6) {
          isMouseDownRef.current = false;
          setIsDragging(false);
          return;
        }
      }

      if (swipingHorizontalRef.current) {
        hasMovedRef.current = true;
        const clamped = Math.min(0, dx);
        swipeOffsetRef.current = clamped;
        setSwipeOffset(clamped);
      }
    };

    const handleMouseUp = () => {
      if (!isMouseDownRef.current) return;
      isMouseDownRef.current = false;
      setIsDragging(false);

      const currentOffset = swipeOffsetRef.current;
      if (currentOffset <= SWIPE_DELETE_THRESHOLD) {
        triggerDelete();
      } else if (currentOffset < -36) {
        setSwipeOffset(SWIPE_OPEN_PX);
        swipeOffsetRef.current = SWIPE_OPEN_PX;
      } else {
        setSwipeOffset(0);
        swipeOffsetRef.current = 0;
      }

      setTimeout(() => {
        hasMovedRef.current = false;
      }, 60);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDeleting]);

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
  const isPastDeleteThreshold = swipeOffset <= SWIPE_DELETE_THRESHOLD;

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden border-b border-[#F1F5F9] last:border-b-0"
      style={{ opacity: isDeleting ? 0 : 1, transition: isDeleting ? 'opacity 0.25s ease' : undefined }}
    >
      {/* Swipe-Left Delete Drawer */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-end overflow-hidden"
        style={{
          width: swipeOffset < 0 ? `${Math.max(80, Math.abs(swipeOffset))}px` : '0px',
          backgroundColor: isPastDeleteThreshold ? '#DC2626' : '#EF4444',
          transition: isDragging ? 'none' : 'width 0.2s ease-out, background-color 0.15s',
        }}
      >
        <button
          type="button"
          onClick={triggerDelete}
          className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-0.5 text-white"
        >
          <Trash2 className="h-[18px] w-[18px] stroke-[2]" />
          <span className="text-[11px] font-semibold">
            {isPastDeleteThreshold ? 'Release' : 'Delete'}
          </span>
        </button>
      </div>

      {/* Foreground Task Row — draggable via touch (mobile) & mouse (desktop) */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
        className={`relative flex items-center justify-between gap-3 bg-white py-3.5 select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* Sharp Square Checkbox */}
          <button
            type="button"
            data-no-drag="true"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(task._id);
            }}
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
            onClick={(e) => {
              if (hasMovedRef.current) {
                e.preventDefault();
                return;
              }
              if (swipeOffset < 0) {
                setSwipeOffset(0);
                swipeOffsetRef.current = 0;
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

        {/* Trailing Action Icons (Trash + SquarePen) */}
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            data-no-drag="true"
            onClick={(e) => {
              e.stopPropagation();
              triggerDelete();
            }}
            aria-label={`Delete ${task.title}`}
            className="flex h-7 w-6 cursor-pointer items-center justify-center rounded-none text-[#B0B7C3] transition hover:bg-red-50 hover:text-[#EF4444]"
          >
            <Trash2 className="h-[17px] w-[17px] stroke-[1.6]" />
          </button>
          <button
            type="button"
            data-no-drag="true"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
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

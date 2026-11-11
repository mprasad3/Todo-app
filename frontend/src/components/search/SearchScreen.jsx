import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, Search, SquarePen, Trash2 } from 'lucide-react';
import { taskService } from '../../services/tasks.js';
import { extractDateStr } from '../../utils/date.js';

const PRIORITY_STYLES = {
  high: 'border border-red-200 bg-red-50 text-red-600',
  medium: 'border border-yellow-300 bg-yellow-50 text-yellow-700',
  low: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
};

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function HighlightText({ text, query }) {
  if (!text) return null;
  const trimmed = query.trim();
  if (!trimmed) return text;

  const regex = new RegExp(`(${escapeRegExp(trimmed)})`, 'gi');
  const parts = text.split(regex);
  const lowerQuery = trimmed.toLowerCase();

  return parts.map((part, idx) =>
    part.toLowerCase() === lowerQuery ? (
      <mark
        key={idx}
        className="bg-[#FEF08A] px-0.5 font-semibold text-[#111827]"
      >
        {part}
      </mark>
    ) : (
      <span key={idx}>{part}</span>
    )
  );
}

function SwipeableSearchRow({ task, query, onToggle, onEdit, onDelete }) {
  const isCompleted = task.status === 'completed';
  const priority = task.priority || 'medium';
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const swipingHorizontalRef = useRef(false);
  const swipeOffsetRef = useRef(0);
  const isMouseDownRef = useRef(false);
  const hasMovedRef = useRef(false);

  const SWIPE_OPEN_PX = -80;
  const SWIPE_DELETE_THRESHOLD = -160;

  const trimmedQuery = query.trim();
  const showDescriptionMatch =
    trimmedQuery &&
    task.description &&
    task.description.toLowerCase().includes(trimmedQuery.toLowerCase());

  const triggerDelete = () => {
    if (isDeleting) return;
    setIsDeleting(true);
    setSwipeOffset(-window.innerWidth);
    swipeOffsetRef.current = -window.innerWidth;
    setTimeout(() => onDelete(task._id), 280);
  };

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

  const handleMouseDown = (e) => {
    if (e.button !== 0 || isDeleting) return;
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

  const isPastDeleteThreshold = swipeOffset <= SWIPE_DELETE_THRESHOLD;

  return (
    <div
      className="relative overflow-hidden border-b border-[#F3F4F6]"
      style={{ opacity: isDeleting ? 0 : 1, transition: isDeleting ? 'opacity 0.25s ease' : undefined }}
    >
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

      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
        className={`flex items-center justify-between gap-3 bg-white py-4 select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div className="flex min-w-0 flex-1 items-start gap-3.5">
          <button
            type="button"
            data-no-drag="true"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(task._id);
            }}
            aria-label={isCompleted ? 'Mark in progress' : 'Mark completed'}
            className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 cursor-pointer items-center justify-center rounded-none border-[1.5px] transition ${
              isCompleted
                ? 'border-[#4566EC] bg-[#EEF3FF] text-[#4566EC]'
                : 'border-[#6A82FB] bg-white'
            }`}
          >
            {isCompleted && <Check className="h-3 w-3 stroke-[2.8]" />}
          </button>

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
              className={`truncate text-[14px] font-medium ${
                isCompleted ? 'text-[#9CA3AF] line-through' : 'text-[#111827]'
              }`}
            >
              <HighlightText text={task.title} query={query} />
            </p>

            {showDescriptionMatch && (
              <p className="mt-0.5 truncate text-[12px] text-[#6B7280]">
                <HighlightText text={task.description} query={query} />
              </p>
            )}

            <div className="mt-1 flex items-center gap-2">
              <span className="text-[11px] text-[#9CA3AF]">
                {extractDateStr(task.dueAt)}
              </span>
              <span
                className={`rounded-none px-1.5 py-0.5 text-[10px] font-semibold capitalize ${
                  PRIORITY_STYLES[priority] || PRIORITY_STYLES.medium
                }`}
              >
                {priority}
              </span>
            </div>
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            data-no-drag="true"
            onClick={(e) => {
              e.stopPropagation();
              triggerDelete();
            }}
            aria-label={`Delete ${task.title}`}
            className="flex h-7 w-6 cursor-pointer items-center justify-center rounded-none text-[#9CA3AF] transition hover:bg-red-50 hover:text-[#EF4444]"
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
            className="flex h-7 w-6 cursor-pointer items-center justify-center rounded-none text-[#9CA3AF] transition hover:bg-slate-100 hover:text-[#4566EC]"
          >
            <SquarePen className="h-[17px] w-[17px] stroke-[1.6]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function SearchScreen({
  onBack,
  onEditTask,
  onToggleTask,
  onDeleteTask,
  refreshSignal,
}) {
  const [query, setQuery] = useState('');
  const [allTasks, setAllTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadTasks() {
      setIsLoading(true);
      setError('');
      try {
        const data = await taskService.list({});
        if (active) {
          setAllTasks(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Failed to load tasks');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }
    loadTasks();
    return () => {
      active = false;
    };
  }, [refreshSignal]);

  const filteredTasks = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return allTasks;

    return allTasks.filter((task) => {
      const titleMatch = (task.title || '').toLowerCase().includes(trimmed);
      const descMatch = (task.description || '').toLowerCase().includes(trimmed);
      return titleMatch || descMatch;
    });
  }, [allTasks, query]);

  const handleToggle = async (id) => {
    setAllTasks((prev) =>
      prev.map((t) =>
        t._id === id
          ? { ...t, status: t.status === 'completed' ? 'in_progress' : 'completed' }
          : t
      )
    );
    await onToggleTask(id);
  };

  const handleDelete = async (id) => {
    setAllTasks((prev) => prev.filter((t) => t._id !== id));
    await onDeleteTask(id);
  };

  const trimmedQuery = query.trim();

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-white">
      <div className="px-5 pt-5 pb-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to home"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-none text-[#111827] transition hover:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="mt-4 flex h-[48px] items-center rounded-none border border-[#E5E7EB] px-3.5 focus-within:border-[#4566EC]">
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a task..."
            className="w-full bg-transparent text-[14px] text-[#111827] placeholder-[#9CA3AF] outline-none"
          />
          <Search className="ml-2 h-[18px] w-[18px] shrink-0 text-[#374151]" />
        </div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-8">
        {error && (
          <p className="mt-2 rounded-none bg-red-50 px-3 py-2 text-[12px] text-red-600">
            {error}
          </p>
        )}

        {isLoading ? (
          <div className="mt-4 space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-3 border-b border-[#F3F4F6] pb-4">
                <div className="h-[18px] w-[18px] animate-pulse rounded-none bg-slate-200" />
                <div className="h-4 flex-1 animate-pulse rounded-none bg-slate-200" />
              </div>
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="mt-10 text-center">
            <p className="text-[14px] font-medium text-[#374151]">
              {trimmedQuery
                ? `No tasks matching "${trimmedQuery}"`
                : 'No tasks available yet'}
            </p>
            <p className="mt-1 text-[12px] text-[#9CA3AF]">
              Try searching with characters from a task title or description.
            </p>
          </div>
        ) : (
          <div className="mt-2">
            {filteredTasks.map((task) => (
              <SwipeableSearchRow
                key={task._id}
                task={task}
                query={query}
                onToggle={handleToggle}
                onEdit={onEditTask}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

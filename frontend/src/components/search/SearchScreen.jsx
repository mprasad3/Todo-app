import { useEffect, useMemo, useState } from 'react';
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
      {/* Header matching Figma Frame 9 */}
      <div className="px-5 pt-5 pb-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to home"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-none text-[#111827] transition hover:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Search Input Box */}
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

      {/* Results List */}
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
            {filteredTasks.map((task) => {
              const isCompleted = task.status === 'completed';
              const priority = task.priority || 'medium';
              const showDescriptionMatch =
                trimmedQuery &&
                task.description &&
                task.description.toLowerCase().includes(trimmedQuery.toLowerCase());

              return (
                <div
                  key={task._id}
                  className="flex items-center justify-between gap-3 border-b border-[#F3F4F6] py-4"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3.5">
                    <button
                      type="button"
                      onClick={() => handleToggle(task._id)}
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
                      onClick={() => onEditTask(task)}
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

                  {/* View / Edit / Delete options required by PDF Section 3.1 */}
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleDelete(task._id)}
                      aria-label={`Delete ${task.title}`}
                      className="flex h-7 w-6 cursor-pointer items-center justify-center rounded-none text-[#9CA3AF] transition hover:bg-red-50 hover:text-[#EF4444]"
                    >
                      <Trash2 className="h-[17px] w-[17px] stroke-[1.6]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditTask(task)}
                      aria-label={`Edit ${task.title}`}
                      className="flex h-7 w-6 cursor-pointer items-center justify-center rounded-none text-[#9CA3AF] transition hover:bg-slate-100 hover:text-[#4566EC]"
                    >
                      <SquarePen className="h-[17px] w-[17px] stroke-[1.6]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

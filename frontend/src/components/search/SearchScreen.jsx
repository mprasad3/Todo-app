import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Pencil, Search, Trash2 } from 'lucide-react';
import { taskService } from '../../services/tasks.js';
import { extractDateStr } from '../../utils/date.js';

export function SearchScreen({
  onBack,
  onEditTask,
  onToggleTask,
  onDeleteTask,
  refreshSignal,
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      setError('');
      try {
        const trimmed = query.trim();
        const data = await taskService.list(trimmed ? { q: trimmed } : {});
        if (active) {
          setResults(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Search failed');
        }
      } finally {
        if (active) setIsSearching(false);
      }
    }, 280);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, refreshSignal]);

  const handleToggle = async (id) => {
    setResults((prev) =>
      prev.map((t) =>
        t._id === id
          ? { ...t, status: t.status === 'completed' ? 'in_progress' : 'completed' }
          : t
      )
    );
    await onToggleTask(id);
  };

  const handleDelete = async (id) => {
    setResults((prev) => prev.filter((t) => t._id !== id));
    await onDeleteTask(id);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-white">
      {/* Header matching Figma Frame 9 */}
      <div className="px-5 pt-5 pb-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to home"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#111827] transition hover:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Search Input Box */}
        <div className="mt-4 flex h-[48px] items-center rounded-[8px] border border-[#E5E7EB] px-3.5 focus-within:border-[#3D5AF1]">
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
          <p className="mt-2 rounded-[6px] bg-red-50 px-3 py-2 text-[12px] text-red-600">
            {error}
          </p>
        )}

        {isSearching ? (
          <div className="mt-4 space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-3 border-b border-[#F3F4F6] pb-4">
                <div className="h-[18px] w-[18px] animate-pulse rounded-[4px] bg-slate-200" />
                <div className="h-4 flex-1 animate-pulse rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="mt-10 text-center">
            <p className="text-[14px] font-medium text-[#374151]">
              {query.trim() ? `No tasks matching "${query.trim()}"` : 'No tasks available yet'}
            </p>
            <p className="mt-1 text-[12px] text-[#9CA3AF]">
              Try searching with a keyword from a task title or description.
            </p>
          </div>
        ) : (
          <div className="mt-2">
            {results.map((task) => {
              const isCompleted = task.status === 'completed';
              return (
                <div
                  key={task._id}
                  className="flex items-center justify-between gap-3 border-b border-[#F3F4F6] py-4"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3.5">
                    <button
                      type="button"
                      onClick={() => handleToggle(task._id)}
                      aria-label={isCompleted ? 'Mark in progress' : 'Mark completed'}
                      className={`flex h-[18px] w-[18px] shrink-0 cursor-pointer items-center justify-center rounded-[4px] border-[1.5px] transition ${
                        isCompleted
                          ? 'border-[#3D5AF1] bg-[#EEF3FF] text-[#3D5AF1]'
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
                        {task.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#9CA3AF]">
                        {extractDateStr(task.dueAt)} · {task.priority}
                      </p>
                    </button>
                  </div>

                  {/* View / Edit / Delete options required by PDF Section 3.1 */}
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDelete(task._id)}
                      aria-label={`Delete ${task.title}`}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#9CA3AF] transition hover:bg-red-50 hover:text-[#EF4444]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditTask(task)}
                      aria-label={`Edit ${task.title}`}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#9CA3AF] transition hover:bg-slate-100 hover:text-[#3D5AF1]"
                    >
                      <Pencil className="h-4 w-4" />
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

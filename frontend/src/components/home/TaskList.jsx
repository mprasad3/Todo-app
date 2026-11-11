import { formatFigmaDate, getTodayDateStr } from '../../utils/date.js';
import { TaskItem } from './TaskItem.jsx';

export function TaskList({
  tasks,
  selectedDate,
  viewMode,
  statusFilter,
  isLoading,
  onToggleViewAll,
  onClearStatusFilter,
  onToggleTask,
  onEditTask,
  onDeleteTask,
}) {
  const isToday = selectedDate === getTodayDateStr();

  let heading = 'Tasks Today';
  if (viewMode === 'week') {
    if (statusFilter === 'completed') heading = 'Completed This Week';
    else if (statusFilter === 'in_progress') heading = 'Pending This Week';
    else heading = 'Tasks This Week';
  } else if (!isToday) {
    heading = formatFigmaDate(selectedDate);
  }

  return (
    <section className="px-6 pt-7">
      {/* Header Row matching Figma Image 1 ("Tasks Today" | "View All") */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-[16px] font-bold text-[#111827]">{heading}</h2>
          {statusFilter && (
            <button
              type="button"
              onClick={onClearStatusFilter}
              className="cursor-pointer rounded-none bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-[#6B7280] hover:bg-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleViewAll}
          className="cursor-pointer text-[12px] font-medium text-[#4566EC] transition hover:underline"
        >
          {viewMode === 'week' ? 'Day View' : 'View All'}
        </button>
      </div>

      {/* Task Rows */}
      <div className="mt-3">
        {isLoading ? (
          <div className="space-y-3 py-3">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="flex items-center gap-3 py-2">
                <div className="h-[18px] w-[18px] animate-pulse rounded-none bg-slate-200" />
                <div className="h-4 flex-1 animate-pulse rounded-none bg-slate-200" />
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="my-4 rounded-none border border-dashed border-[#E5E7EB] px-4 py-8 text-center">
            <p className="text-[14px] font-medium text-[#374151]">No tasks found</p>
            <p className="mt-1 text-[12px] text-[#9CA3AF]">
              Tap the + button below to schedule a task.
            </p>
          </div>
        ) : (
          <div>
            {tasks.map((task) => (
              <TaskItem
                key={task._id}
                task={task}
                showDateBadge={viewMode === 'week'}
                onToggle={onToggleTask}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

import { Plus } from 'lucide-react';
import { TopBar } from './TopBar.jsx';
import { WeekCalendarStrip } from './WeekCalendarStrip.jsx';
import { WeeklySummaryCards } from './WeeklySummaryCards.jsx';
import { TaskList } from './TaskList.jsx';

export function HomeScreen({
  selectedDate,
  viewMode,
  statusFilter,
  tasks,
  weeklySummary,
  isLoading,
  error,
  onSelectDate,
  onShiftWeek,
  onToggleWeekView,
  onFilterBySummaryCard,
  onToggleTask,
  onDeleteTask,
  onOpenCreateModal,
  onOpenEditModal,
  onOpenSearch,
  onDismissError,
}) {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-white">
      <div className="shrink-0 bg-white">
        <TopBar onOpenSearch={onOpenSearch} />

        {error && (
          <div className="mx-6 mt-3 flex items-center justify-between rounded-none bg-red-50 px-3 py-2 text-[12px] text-red-600">
            <span>{error}</span>
            <button
              type="button"
              onClick={onDismissError}
              className="ml-2 cursor-pointer font-semibold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <WeekCalendarStrip
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          onShiftWeek={onShiftWeek}
        />

        <WeeklySummaryCards
          summary={weeklySummary}
          activeStatusFilter={statusFilter}
          onSelectSummaryCard={onFilterBySummaryCard}
        />
      </div>

      <TaskList
        tasks={tasks}
        selectedDate={selectedDate}
        viewMode={viewMode}
        statusFilter={statusFilter}
        isLoading={isLoading}
        onToggleViewAll={onToggleWeekView}
        onClearStatusFilter={() => onFilterBySummaryCard(null)}
        onToggleTask={onToggleTask}
        onEditTask={onOpenEditModal}
        onDeleteTask={onDeleteTask}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-7 flex justify-center">
        <button
          type="button"
          onClick={onOpenCreateModal}
          aria-label="Add new task"
          className="pointer-events-auto flex h-[58px] w-[58px] cursor-pointer items-center justify-center rounded-full bg-[#4566EC] text-white shadow-[0_4px_14px_rgba(69,102,236,0.22)] transition hover:bg-[#3655D6] active:scale-95"
        >
          <Plus className="h-6 w-6 stroke-[1.8]" />
        </button>
      </div>
    </div>
  );
}

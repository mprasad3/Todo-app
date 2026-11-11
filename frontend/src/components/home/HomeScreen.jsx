import { Plus } from 'lucide-react';
import { TopBar } from './TopBar.jsx';
import { WeekCalendarStrip } from './WeekCalendarStrip.jsx';
import { WeeklySummaryCards } from './WeeklySummaryCards.jsx';
import { TaskList } from './TaskList.jsx';

export function HomeScreen({
  user,
  selectedDate,
  viewMode,
  statusFilter,
  tasks,
  weeklySummary,
  isLoading,
  error,
  onSelectDate,
  onShiftWeek,
  onJumpToday,
  onToggleWeekView,
  onFilterBySummaryCard,
  onToggleTask,
  onDeleteTask,
  onOpenCreateModal,
  onOpenEditModal,
  onOpenSearch,
  onLogout,
  onDismissError,
}) {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-white">
      <div className="no-scrollbar flex-1 overflow-y-auto pb-24">
        <TopBar
          user={user}
          openCount={weeklySummary?.open ?? 0}
          onOpenSearch={onOpenSearch}
          onLogout={onLogout}
          onJumpToday={onJumpToday}
        />

        {error && (
          <div className="mx-5 mt-3 flex items-center justify-between rounded-[8px] bg-red-50 px-3 py-2 text-[12px] text-red-600">
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
          onJumpToday={onJumpToday}
        />

        <WeeklySummaryCards
          summary={weeklySummary}
          activeStatusFilter={statusFilter}
          onSelectSummaryCard={onFilterBySummaryCard}
        />

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
      </div>

      {/* Centered Floating Action Button (+) matching Figma */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
        <button
          type="button"
          onClick={onOpenCreateModal}
          aria-label="Add new task"
          className="pointer-events-auto flex h-[54px] w-[54px] cursor-pointer items-center justify-center rounded-full bg-[#3D5AF1] text-white shadow-[0_10px_25px_rgba(61,90,241,0.4)] transition hover:bg-[#324CDD] active:scale-95"
        >
          <Plus className="h-6 w-6 stroke-[2.4]" />
        </button>
      </div>
    </div>
  );
}

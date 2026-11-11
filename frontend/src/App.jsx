import { useState } from 'react';
import { MobileShell } from './components/layout/MobileShell.jsx';
import { OnboardingScreen } from './components/onboarding/OnboardingScreen.jsx';
import { HomeScreen } from './components/home/HomeScreen.jsx';
import { SearchScreen } from './components/search/SearchScreen.jsx';
import { TaskFormSheet } from './components/taskModal/TaskFormSheet.jsx';
import { useSession } from './hooks/useSession.js';
import { useTasks } from './hooks/useTasks.js';
import { getTodayDateStr } from './utils/date.js';

export default function App() {
  const session = useSession();
  const tasksState = useTasks(session.isAuthenticated);

  const [activeScreen, setActiveScreen] = useState('home'); // 'home' | 'search'
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'create',
    task: null,
  });
  const [searchRefreshSignal, setSearchRefreshSignal] = useState(0);

  const openCreateModal = () => {
    setModalState({ isOpen: true, mode: 'create', task: null });
  };

  const openEditModal = async (task) => {
    setModalState({ isOpen: true, mode: 'edit', task });
    try {
      const freshTask = await tasksState.fetchTaskById(task._id);
      if (freshTask) {
        setModalState((prev) =>
          prev.isOpen && prev.task?._id === task._id ? { ...prev, task: freshTask } : prev
        );
      }
    } catch {
      // Fall back to existing task data cleanly if detail fetch fails
    }
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: 'create', task: null });
  };

  const handleModalSubmit = async (payload) => {
    if (modalState.mode === 'edit' && modalState.task?._id) {
      await tasksState.updateTask(modalState.task._id, payload);
    } else {
      await tasksState.createTask(payload);
    }
    setSearchRefreshSignal((n) => n + 1);
  };

  const handleDeleteTask = async (id) => {
    await tasksState.deleteTask(id);
    setSearchRefreshSignal((n) => n + 1);
  };

  const handleToggleTask = async (id) => {
    await tasksState.toggleTask(id);
    setSearchRefreshSignal((n) => n + 1);
  };

  return (
    <MobileShell>
      {session.isBootstrapping ? (
        <div className="flex flex-1 flex-col items-center justify-center bg-white">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#DDE3FF] border-t-[#3D5AF1]" />
          <p className="mt-3 text-[13px] font-medium text-[#6B7280]">Loading workspace...</p>
        </div>
      ) : !session.isAuthenticated ? (
        <OnboardingScreen
          onLogin={session.login}
          isSubmitting={session.isSubmitting}
          error={session.error}
          onClearError={() => session.setError(null)}
        />
      ) : activeScreen === 'search' ? (
        <SearchScreen
          onBack={() => setActiveScreen('home')}
          onEditTask={openEditModal}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
          refreshSignal={searchRefreshSignal}
        />
      ) : (
        <HomeScreen
          user={session.user}
          selectedDate={tasksState.selectedDate}
          viewMode={tasksState.viewMode}
          statusFilter={tasksState.statusFilter}
          tasks={tasksState.tasks}
          weeklySummary={tasksState.weeklySummary}
          isLoading={tasksState.isLoading}
          error={tasksState.error}
          onSelectDate={tasksState.selectDate}
          onShiftWeek={tasksState.shiftWeek}
          onJumpToday={() => tasksState.selectDate(getTodayDateStr())}
          onToggleWeekView={tasksState.toggleWeekView}
          onFilterBySummaryCard={tasksState.filterBySummaryCard}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
          onOpenCreateModal={openCreateModal}
          onOpenEditModal={openEditModal}
          onOpenSearch={() => setActiveScreen('search')}
          onLogout={session.logout}
          onDismissError={() => tasksState.setError(null)}
        />
      )}

      <TaskFormSheet
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        initialTask={modalState.task}
        defaultDate={tasksState.selectedDate}
        isSaving={tasksState.isSaving}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
      />
    </MobileShell>
  );
}

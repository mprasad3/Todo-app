import { useEffect, useRef, useState } from 'react';
import { Bell, LogOut, Search, Settings, User } from 'lucide-react';

export function TopBar({
  user,
  openCount,
  onOpenSearch,
  onLogout,
  onJumpToday,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const menuRef = useRef(null);
  const bellRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <header className="px-5 pt-4 pb-1">
      {/* Top Icons Row matching Figma */}
      <div className="flex items-center justify-between">
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => {
              setMenuOpen((prev) => !prev);
              setBellOpen(false);
            }}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#111827] transition hover:bg-slate-100"
            aria-label="Account settings"
          >
            <Settings className="h-[20px] w-[20px] stroke-[1.8]" />
          </button>

          {menuOpen && (
            <div className="animate-fade-in absolute top-10 left-0 z-30 w-56 rounded-[12px] border border-[#E5E7EB] bg-white p-2 shadow-lg">
              <div className="flex items-center gap-2.5 border-b border-[#F3F4F6] px-2.5 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF3FF] text-[#3D5AF1]">
                  <User className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-[#111827]">
                    {user?.username || 'User'}
                  </p>
                  <p className="text-[11px] text-[#6B7280]">Active Session</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onJumpToday();
                }}
                className="mt-1 flex w-full cursor-pointer items-center rounded-[8px] px-2.5 py-2 text-left text-[13px] font-medium text-[#374151] transition hover:bg-slate-50"
              >
                Jump to Today
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-[8px] px-2.5 py-2 text-left text-[13px] font-medium text-[#EF4444] transition hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Log Out / Switch User
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#111827] transition hover:bg-slate-100"
            aria-label="Open search"
          >
            <Search className="h-[20px] w-[20px] stroke-[1.8]" />
          </button>

          <div className="relative" ref={bellRef}>
            <button
              type="button"
              onClick={() => {
                setBellOpen((prev) => !prev);
                setMenuOpen(false);
              }}
              className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#111827] transition hover:bg-slate-100"
              aria-label="Task notifications"
            >
              <Bell className="h-[20px] w-[20px] stroke-[1.8]" />
              {openCount > 0 && (
                <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-[#EF4444]" />
              )}
            </button>

            {bellOpen && (
              <div className="animate-fade-in absolute top-10 right-0 z-30 w-60 rounded-[12px] border border-[#E5E7EB] bg-white p-3 shadow-lg">
                <p className="text-[12px] font-semibold text-[#111827]">Weekly Reminder</p>
                <p className="mt-1 text-[12px] leading-relaxed text-[#6B7280]">
                  {openCount > 0
                    ? `You have ${openCount} pending task${openCount === 1 ? '' : 's'} remaining this week.`
                    : 'All tasks for this week are completed!'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inline Search Bar matching Figma Home screen */}
      <button
        type="button"
        onClick={onOpenSearch}
        className="mt-2.5 flex h-[44px] w-full cursor-pointer items-center justify-between rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-left transition hover:border-[#3D5AF1]/50"
      >
        <span className="text-[13px] text-[#9CA3AF]">Search for a task</span>
        <Search className="h-[18px] w-[18px] text-[#374151]" />
      </button>
    </header>
  );
}

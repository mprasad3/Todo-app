import { Search } from 'lucide-react';

export function TopBar({ onOpenSearch }) {
  return (
    <header className="px-6 pt-7 pb-1">
      {/* Search Bar matching Figma Image 1 */}
      <button
        type="button"
        onClick={onOpenSearch}
        className="flex h-[46px] w-full cursor-pointer items-center justify-between rounded-none border border-[#D1D5DB] bg-white px-4 text-left transition hover:border-[#4566EC]/60"
      >
        <span className="text-[13px] font-normal text-[#9CA3AF]">Search for a task</span>
        <Search className="h-[19px] w-[19px] stroke-[1.8] text-[#111827]" />
      </button>
    </header>
  );
}

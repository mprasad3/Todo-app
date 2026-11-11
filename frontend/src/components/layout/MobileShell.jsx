export function MobileShell({ children }) {
  return (
    <div className="min-h-[100dvh] w-full bg-[#F3F5F9] sm:flex sm:items-center sm:justify-center sm:p-6">
      <div className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-white sm:h-[844px] sm:min-h-0 sm:max-h-[94dvh] sm:w-[390px] sm:rounded-[32px] sm:border sm:border-slate-200/80 sm:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
        {children}
      </div>
    </div>
  );
}

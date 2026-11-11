import { useState } from 'react';
import { X } from 'lucide-react';

function ZigzagPattern({ className }) {
  return (
    <svg
      viewBox="0 0 116 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {[0, 14, 28].map((offsetY) => (
        <path
          key={offsetY}
          d={`M2 ${14 + offsetY}L16 ${4 + offsetY}L30 ${14 + offsetY}L44 ${4 + offsetY}L58 ${14 + offsetY}L72 ${4 + offsetY}L86 ${14 + offsetY}L100 ${4 + offsetY}L114 ${14 + offsetY}`}
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

export function OnboardingScreen({ onLogin, isSubmitting, error, onClearError }) {
  const [showUsernameSheet, setShowUsernameSheet] = useState(false);
  const [username, setUsername] = useState('');
  const [localError, setLocalError] = useState('');

  const handleGetStarted = () => {
    setLocalError('');
    if (onClearError) onClearError();
    setShowUsernameSheet(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = username.trim().replace(/\s+/g, ' ');
    if (trimmed.length < 2 || trimmed.length > 40) {
      setLocalError('Please enter a username between 2 and 40 characters.');
      return;
    }
    setLocalError('');
    try {
      await onLogin(trimmed);
    } catch {}
  };

  const displayError = localError || error;

  return (
    <div className="relative flex flex-1 flex-col bg-white">
      <div className="relative flex-[1.7] overflow-hidden bg-[#4566EC]">
        <div
          className="pointer-events-none absolute -top-10 -right-10 h-36 w-36 rounded-full border-[18px] border-white/15"
          aria-hidden="true"
        />
        <ZigzagPattern className="pointer-events-none absolute top-[32%] -left-5 w-28 text-white/20" />
        <ZigzagPattern className="pointer-events-none absolute right-2 bottom-6 w-28 text-white/20" />
      </div>

      <div className="flex flex-1 flex-col justify-between bg-white px-6 pt-8 pb-8">
        <div>
          <h1 className="text-[24px] leading-tight font-bold tracking-tight text-[#111827]">
            Manage What To Do
          </h1>
          <p className="mt-2.5 text-[14px] leading-[1.55] text-[#6B7280]">
            The best way to manage what you have to do, don&apos;t forget your plans
          </p>
        </div>

        <button
          type="button"
          onClick={handleGetStarted}
          className="mt-6 h-[50px] w-full cursor-pointer rounded-none bg-[#4566EC] text-[15px] font-semibold text-white shadow-sm transition hover:bg-[#3655D6] active:scale-[0.99]"
        >
          Get Started
        </button>
      </div>

      {showUsernameSheet && (
        <div
          className="animate-fade-in absolute inset-0 z-30 flex items-end bg-black/45"
          onClick={() => setShowUsernameSheet(false)}
        >
          <div
            className="animate-sheet-up w-full rounded-none bg-white px-6 pt-6 pb-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[19px] font-bold text-[#111827]">Welcome</h2>
              <button
                type="button"
                onClick={() => setShowUsernameSheet(false)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-none text-[#6B7280] transition hover:bg-slate-100"
                aria-label="Close login modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-1.5 text-[13px] text-[#6B7280]">
              Enter your username to access or create your task workspace.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="username-input"
                  className="mb-1.5 block text-[13px] font-medium text-[#111827]"
                >
                  Username
                </label>
                <input
                  id="username-input"
                  type="text"
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. alice"
                  maxLength={40}
                  className="h-[46px] w-full rounded-none border border-[#E5E7EB] px-3.5 text-[14px] text-[#111827] placeholder-[#9CA3AF] transition outline-none focus:border-[#4566EC] focus:ring-2 focus:ring-[#4566EC]/15"
                />
              </div>

              {displayError && (
                <p className="rounded-none bg-red-50 px-3 py-2 text-[12px] text-red-600">
                  {displayError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-[48px] w-full cursor-pointer rounded-none bg-[#4566EC] text-[15px] font-semibold text-white transition hover:bg-[#3655D6] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Starting Session...' : 'Continue'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

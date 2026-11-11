import { useEffect, useRef, useState } from 'react';
import { Calendar, Clock, X } from 'lucide-react';
import {
  combineDateAndTimeIso,
  extractDateStr,
  extractTimeStr,
  formatDisplayTime,
  formatFigmaDate,
  getTodayDateStr,
  toUtcMidnightIso,
} from '../../utils/date.js';

const PRIORITIES = [
  {
    value: 'low',
    label: 'Low',
    activeClass: 'border-emerald-500 bg-emerald-50 text-emerald-700',
  },
  {
    value: 'medium',
    label: 'Medium',
    activeClass: 'border-yellow-500 bg-yellow-50 text-yellow-700',
  },
  {
    value: 'high',
    label: 'High',
    activeClass: 'border-red-500 bg-red-50 text-red-600',
  },
];

export function TaskFormSheet({
  isOpen,
  mode = 'create',
  initialTask = null,
  defaultDate,
  isSaving,
  onClose,
  onSubmit,
}) {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [dateStr, setDateStr] = useState(defaultDate || getTodayDateStr());
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  const dateInputRef = useRef(null);
  const startInputRef = useRef(null);
  const endInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setFormError('');

    if (mode === 'edit' && initialTask) {
      setTitle(initialTask.title || '');
      setDateStr(extractDateStr(initialTask.dueAt));
      setStartTime(extractTimeStr(initialTask.startAt));
      setEndTime(extractTimeStr(initialTask.endAt));
      setPriority(initialTask.priority || 'medium');
      setDescription(initialTask.description || '');
    } else {
      setTitle('');
      setDateStr(defaultDate || getTodayDateStr());
      setStartTime('');
      setEndTime('');
      setPriority('medium');
      setDescription('');
    }
  }, [isOpen, mode, initialTask, defaultDate]);

  if (!isOpen) return null;

  const openPicker = (ref) => {
    if (!ref.current) return;
    if (typeof ref.current.showPicker === 'function') {
      try {
        ref.current.showPicker();
        return;
      } catch {}
    }
    ref.current.focus();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFormError('Task title is required.');
      return;
    }
    if (!dateStr) {
      setFormError('Date is required.');
      return;
    }
    if (!startTime) {
      setFormError('Start time is required.');
      return;
    }
    if (startTime && endTime && endTime < startTime) {
      setFormError('End time cannot be earlier than start time.');
      return;
    }

    setFormError('');

    const payload = {
      title: trimmedTitle,
      description: description.trim(),
      dueAt: toUtcMidnightIso(dateStr),
      startAt: combineDateAndTimeIso(dateStr, startTime),
      endAt: endTime ? combineDateAndTimeIso(dateStr, endTime) : null,
      priority,
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setFormError(err?.message || 'Unable to save task.');
    }
  };

  return (
    <div
      className="animate-fade-in absolute inset-0 z-40 flex items-end bg-black/35"
      onClick={onClose}
    >
      <div
        className="animate-sheet-up max-h-[92%] sm:max-h-[88%] w-full overflow-y-auto rounded-none bg-white px-6 pt-5 pb-6 shadow-2xl no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] sm:text-[18px] font-semibold text-[#111827]">
            {mode === 'edit' ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-none text-[#111827] transition hover:bg-slate-100"
          >
            <X className="h-[18px] w-[18px] stroke-[1.8]" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="mt-4 space-y-3">
          <div>
            <label
              htmlFor="task-title"
              className="mb-1 block text-[12px] font-normal text-[#6B7280]"
            >
              Task title <span className="text-[#EF4444]">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Doing Homework"
              maxLength={140}
              className="h-[42px] w-full rounded-none border border-[#E5E7EB] px-3.5 text-[13.5px] text-[#111827] placeholder-[#9CA3AF] outline-none transition focus:border-[#4566EC]"
            />
          </div>

          <div>
            <span className="mb-1 block text-[12px] font-normal text-[#6B7280]">
              Set Time <span className="text-[#EF4444]">*</span>
            </span>
            <div className="grid grid-cols-2 gap-3.5">
              <div
                onClick={() => openPicker(startInputRef)}
                className="relative flex h-[42px] cursor-pointer items-center gap-2.5 rounded-none border border-[#E5E7EB] px-3 transition focus-within:border-[#4566EC] hover:border-[#4566EC]/60"
              >
                <Clock className="h-[16px] w-[16px] shrink-0 stroke-[1.8] text-[#111827]" />
                <span
                  className={`truncate text-[13.5px] ${
                    startTime ? 'text-[#111827]' : 'text-[#374151]'
                  }`}
                >
                  {startTime ? formatDisplayTime(`2000-01-01T${startTime}:00.000Z`) : 'Start'}
                </span>
                <input
                  ref={startInputRef}
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  aria-label="Start time"
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </div>

              <div
                onClick={() => openPicker(endInputRef)}
                className="relative flex h-[42px] cursor-pointer items-center gap-2.5 rounded-none border border-[#E5E7EB] px-3 transition focus-within:border-[#4566EC] hover:border-[#4566EC]/60"
              >
                <Clock className="h-[16px] w-[16px] shrink-0 stroke-[1.8] text-[#111827]" />
                <span
                  className={`truncate text-[13.5px] ${
                    endTime ? 'text-[#111827]' : 'text-[#374151]'
                  }`}
                >
                  {endTime ? formatDisplayTime(`2000-01-01T${endTime}:00.000Z`) : 'Ends'}
                </span>
                <input
                  ref={endInputRef}
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  aria-label="End time"
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </div>
            </div>
          </div>

          <div>
            <span className="mb-1 block text-[12px] font-normal text-[#6B7280]">
              Set Date <span className="text-[#EF4444]">*</span>
            </span>
            <div
              onClick={() => openPicker(dateInputRef)}
              className="relative flex h-[42px] cursor-pointer items-center justify-between rounded-none border border-[#E5E7EB] px-3.5 transition focus-within:border-[#4566EC] hover:border-[#4566EC]/60"
            >
              <span className="text-[13.5px] text-[#111827]">
                {formatFigmaDate(dateStr)}
              </span>
              <Calendar className="h-[16px] w-[16px] stroke-[1.8] text-[#111827]" />
              <input
                ref={dateInputRef}
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                aria-label="Set Date"
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </div>
          </div>

          {mode === 'edit' && (
            <div>
              <span className="mb-1 block text-[12px] font-normal text-[#6B7280]">
                Priority
              </span>
              <div className="grid grid-cols-3 gap-2">
                {PRIORITIES.map((item) => {
                  const active = priority === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setPriority(item.value)}
                      className={`h-[30px] cursor-pointer rounded-none border text-[11.5px] font-medium transition ${
                        active
                          ? item.activeClass
                          : 'border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="task-description"
              className="mb-1 block text-[12px] font-normal text-[#6B7280]"
            >
              Description
            </label>
            <textarea
              id="task-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add Description"
              maxLength={2000}
              className="h-[78px] w-full resize-none rounded-none border border-[#E5E7EB] px-3.5 py-2 text-[13.5px] text-[#111827] placeholder-[#9CA3AF] outline-none transition focus:border-[#4566EC]"
            />
          </div>

          {formError && (
            <p className="rounded-none bg-red-50 px-3 py-2 text-[12px] text-red-600">
              {formError}
            </p>
          )}

          <div className="pt-1">
            <button
              type="submit"
              disabled={isSaving}
              className="h-[46px] w-full cursor-pointer rounded-none bg-[#4566EC] text-[14.5px] font-medium text-white transition hover:bg-[#3655D6] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving
                ? 'Saving...'
                : mode === 'edit'
                  ? 'Save changes'
                  : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

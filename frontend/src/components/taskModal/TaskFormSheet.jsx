import { useEffect, useRef, useState } from 'react';
import { Calendar, Clock, X } from 'lucide-react';
import {
  combineDateAndTimeIso,
  extractDateStr,
  extractTimeStr,
  formatFigmaDate,
  getTodayDateStr,
  toUtcMidnightIso,
} from '../../utils/date.js';

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
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
      className="animate-fade-in absolute inset-0 z-40 flex items-end bg-black/45"
      onClick={onClose}
    >
      <div
        className="animate-sheet-up max-h-[90%] w-full overflow-y-auto rounded-t-[24px] bg-white px-6 pt-6 pb-7 shadow-2xl no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[19px] font-bold text-[#111827]">
            {mode === 'edit' ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#111827] transition hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
          {/* Task Title */}
          <div>
            <label
              htmlFor="task-title"
              className="mb-1.5 block text-[12px] font-medium text-[#374151]"
            >
              Task title
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Doing Homework"
              maxLength={140}
              className="h-[44px] w-full rounded-[6px] border border-[#E5E7EB] px-3.5 text-[14px] text-[#111827] placeholder-[#9CA3AF] outline-none transition focus:border-[#3D5AF1]"
            />
          </div>

          {/* Set Time (Start & Ends) */}
          <div>
            <span className="mb-1.5 block text-[12px] font-medium text-[#374151]">
              Set Time
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => startInputRef.current?.showPicker?.() || startInputRef.current?.focus()}
                className="relative flex h-[44px] cursor-pointer items-center gap-2 rounded-[6px] border border-[#E5E7EB] px-3 focus-within:border-[#3D5AF1]"
              >
                <Clock className="h-4 w-4 shrink-0 text-[#6B7280]" />
                <input
                  ref={startInputRef}
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  aria-label="Start time"
                  className="w-full cursor-pointer bg-transparent text-[13px] text-[#111827] outline-none"
                />
                {!startTime && (
                  <span className="pointer-events-none absolute left-9 bg-white pr-4 text-[13px] text-[#6B7280]">
                    Start
                  </span>
                )}
              </div>

              <div
                onClick={() => endInputRef.current?.showPicker?.() || endInputRef.current?.focus()}
                className="relative flex h-[44px] cursor-pointer items-center gap-2 rounded-[6px] border border-[#E5E7EB] px-3 focus-within:border-[#3D5AF1]"
              >
                <Clock className="h-4 w-4 shrink-0 text-[#6B7280]" />
                <input
                  ref={endInputRef}
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  aria-label="End time"
                  className="w-full cursor-pointer bg-transparent text-[13px] text-[#111827] outline-none"
                />
                {!endTime && (
                  <span className="pointer-events-none absolute left-9 bg-white pr-4 text-[13px] text-[#6B7280]">
                    Ends
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Set Date */}
          <div>
            <span className="mb-1.5 block text-[12px] font-medium text-[#374151]">
              Set Date
            </span>
            <div
              onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.focus()}
              className="relative flex h-[44px] cursor-pointer items-center justify-between rounded-[6px] border border-[#E5E7EB] px-3.5 transition hover:border-[#3D5AF1]/60"
            >
              <span className="text-[14px] text-[#111827]">
                {formatFigmaDate(dateStr)}
              </span>
              <Calendar className="h-4 w-4 text-[#374151]" />
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

          {/* Priority Selector */}
          <div>
            <span className="mb-1.5 block text-[12px] font-medium text-[#374151]">
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
                    className={`h-[36px] cursor-pointer rounded-[6px] border text-[13px] font-medium transition ${
                      active
                        ? 'border-[#3D5AF1] bg-[#EEF3FF] text-[#3D5AF1]'
                        : 'border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="task-description"
              className="mb-1.5 block text-[12px] font-medium text-[#374151]"
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
              className="w-full resize-none rounded-[6px] border border-[#E5E7EB] p-3.5 text-[14px] text-[#111827] placeholder-[#9CA3AF] outline-none transition focus:border-[#3D5AF1]"
            />
          </div>

          {formError && (
            <p className="rounded-[6px] bg-red-50 px-3 py-2 text-[12px] text-red-600">
              {formError}
            </p>
          )}

          {/* Submit CTA Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="mt-2 h-[48px] w-full cursor-pointer rounded-[8px] bg-[#3D5AF1] text-[15px] font-semibold text-white transition hover:bg-[#324CDD] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving
              ? 'Saving...'
              : mode === 'edit'
                ? 'Save changes'
                : 'Create task'}
          </button>
        </form>
      </div>
    </div>
  );
}

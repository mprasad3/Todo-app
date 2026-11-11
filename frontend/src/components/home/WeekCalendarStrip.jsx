import { useEffect, useMemo, useRef, useState } from 'react';
import { getWeekDays, shiftDateStr } from '../../utils/date.js';

function WeekRow({ days, selectedDate, onSelectDate, hasMovedRef }) {
  return (
    <div className="grid w-full flex-shrink-0 grid-cols-7 select-none">
      {days.map((day) => {
        const isSelected = day.dateStr === selectedDate;
        return (
          <div key={day.dateStr} className="flex justify-center">
            <button
              type="button"
              onClick={() => {
                if (hasMovedRef.current) return;
                onSelectDate(day.dateStr);
              }}
              className={`flex w-[42px] cursor-pointer flex-col items-center justify-center rounded-none py-2 transition-colors ${
                isSelected
                  ? 'bg-[#4566EC] text-white'
                  : 'text-[#9CA3AF] hover:bg-slate-50'
              }`}
            >
              <span
                className={`text-[11px] font-normal ${
                  isSelected ? 'text-white' : 'text-[#9CA3AF]'
                }`}
              >
                {day.dayShort}
              </span>
              <span
                className={`mt-1.5 text-[13px] font-medium ${
                  isSelected ? 'text-white' : 'text-[#9CA3AF]'
                }`}
              >
                {day.dayNumber}
              </span>
              <span
                className={`mt-1.5 h-1 w-1 rounded-full ${
                  isSelected
                    ? 'bg-white'
                    : day.isToday
                      ? 'bg-[#4566EC]/50'
                      : 'bg-transparent'
                }`}
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function WeekCalendarStrip({
  selectedDate,
  onSelectDate,
  onShiftWeek,
}) {
  const prevWeekDays = useMemo(() => getWeekDays(shiftDateStr(selectedDate, -7)), [selectedDate]);
  const currWeekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
  const nextWeekDays = useMemo(() => getWeekDays(shiftDateStr(selectedDate, 7)), [selectedDate]);

  const containerRef = useRef(null);

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);
  const axisRef = useRef(null);
  const hasMovedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const isMouseDownRef = useRef(false);

  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [targetPercent, setTargetPercent] = useState(-100);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleDragEnd = (dx) => {
    isDraggingRef.current = false;
    setIsDragging(false);

    const dt = Math.max(1, Date.now() - startTimeRef.current);
    const velocity = Math.abs(dx) / dt;
    const isFlick = velocity > 0.22 && Math.abs(dx) > 18;
    const isLongDrag = Math.abs(dx) > 42;

    if ((isLongDrag || isFlick) && dx < 0) {
      setIsAnimating(true);
      isAnimatingRef.current = true;
      setTargetPercent(-200);

      setTimeout(() => {
        onShiftWeek(1);
        setIsAnimating(false);
        isAnimatingRef.current = false;
        setTargetPercent(-100);
        setDragX(0);
        setTimeout(() => {
          hasMovedRef.current = false;
        }, 50);
      }, 250);
    } else if ((isLongDrag || isFlick) && dx > 0) {
      setIsAnimating(true);
      isAnimatingRef.current = true;
      setTargetPercent(0);

      setTimeout(() => {
        onShiftWeek(-1);
        setIsAnimating(false);
        isAnimatingRef.current = false;
        setTargetPercent(-100);
        setDragX(0);
        setTimeout(() => {
          hasMovedRef.current = false;
        }, 50);
      }, 250);
    } else {
      setIsAnimating(true);
      isAnimatingRef.current = true;
      setTargetPercent(-100);
      setDragX(0);

      setTimeout(() => {
        setIsAnimating(false);
        isAnimatingRef.current = false;
        setTimeout(() => {
          hasMovedRef.current = false;
        }, 50);
      }, 200);
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e) => {
      if (isAnimatingRef.current) return;
      startXRef.current = e.touches[0].clientX;
      startYRef.current = e.touches[0].clientY;
      startTimeRef.current = Date.now();
      axisRef.current = null;
      hasMovedRef.current = false;
      isDraggingRef.current = true;
      setIsDragging(true);
    };

    const onTouchMove = (e) => {
      if (!isDraggingRef.current || isAnimatingRef.current) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const dx = currentX - startXRef.current;
      const dy = currentY - startYRef.current;

      if (!axisRef.current) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        axisRef.current = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v';
      }

      if (axisRef.current === 'h') {
        if (e.cancelable) e.preventDefault();
        hasMovedRef.current = true;
        const containerWidth = el.offsetWidth || 350;
        const clampedDx = Math.max(-containerWidth, Math.min(containerWidth, dx));
        setDragX(clampedDx);
      }
    };

    const onTouchEnd = (e) => {
      if (!isDraggingRef.current) return;
      if (axisRef.current === 'h') {
        const endX = e.changedTouches?.[0]?.clientX ?? startXRef.current;
        const dx = endX - startXRef.current;
        handleDragEnd(dx);
      } else {
        isDraggingRef.current = false;
        setIsDragging(false);
        setDragX(0);
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [onShiftWeek]);

  const handleMouseDown = (e) => {
    if (e.button !== 0 || isAnimatingRef.current) return;
    isMouseDownRef.current = true;
    startXRef.current = e.clientX;
    startTimeRef.current = Date.now();
    hasMovedRef.current = false;
    isDraggingRef.current = true;
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isMouseDownRef.current || isAnimatingRef.current) return;
      const dx = e.clientX - startXRef.current;
      if (Math.abs(dx) > 5) {
        hasMovedRef.current = true;
      }
      const el = containerRef.current;
      const containerWidth = el?.offsetWidth || 350;
      const clampedDx = Math.max(-containerWidth, Math.min(containerWidth, dx));
      setDragX(clampedDx);
    };

    const handleMouseUp = (e) => {
      if (!isMouseDownRef.current) return;
      isMouseDownRef.current = false;
      const dx = e.clientX - startXRef.current;
      handleDragEnd(dx);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onShiftWeek]);

  return (
    <section className="overflow-hidden px-3 pt-5">
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        className={`relative w-full touch-pan-y select-none overflow-hidden ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div
          className="flex w-full"
          style={{
            transform: isDragging
              ? `translateX(calc(-100% + ${dragX}px))`
              : `translateX(${targetPercent}%)`,
            transition: isAnimating
              ? 'transform 0.25s cubic-bezier(0.2, 0, 0.2, 1)'
              : 'none',
            willChange: 'transform',
          }}
        >
          <WeekRow
            days={prevWeekDays}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            hasMovedRef={hasMovedRef}
          />
          <WeekRow
            days={currWeekDays}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            hasMovedRef={hasMovedRef}
          />
          <WeekRow
            days={nextWeekDays}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            hasMovedRef={hasMovedRef}
          />
        </div>
      </div>
    </section>
  );
}

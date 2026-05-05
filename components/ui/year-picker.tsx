'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { createPortal } from 'react-dom';

interface YearPickerProps {
  value: number;
  onChange: (year: number) => void;
  label?: string;
  required?: boolean;
  minYear?: number;
  maxYear?: number;
}

interface DropdownPos {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
}

export default function YearPicker({
  value,
  onChange,
  label,
  required,
  minYear = 2010,
  maxYear = 2030,
}: YearPickerProps) {
  const [open, setOpen] = useState(false);
  const [openAbove, setOpenAbove] = useState(false);
  const [pos, setPos] = useState<DropdownPos>({ top: 0, left: 0, width: 0 });
  const [pageStart, setPageStart] = useState(() => {
    return Math.floor((value - minYear) / 12) * 12 + minYear;
  });
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Re-sync pageStart when value changes externally
  useEffect(() => {
    setPageStart(Math.floor((value - minYear) / 12) * 12 + minYear);
  }, [value, minYear]);

  const calcPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownH = 320; // approx height
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const spaceAbove = rect.top - 8;
    const above = spaceBelow < dropdownH && spaceAbove >= dropdownH;

    setOpenAbove(above);
    setPos({
      left: Math.max(8, Math.min(rect.left, window.innerWidth - Math.min(rect.width, 288) - 8)),
      width: Math.min(rect.width, 288),
      ...(above
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    });
  }, []);

  const handleOpen = () => {
    calcPosition();
    setOpen(true);
  };

  // Close on outside click / scroll / resize
  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (triggerRef.current && triggerRef.current.contains(e.target as Node)) return;
      setOpen(false);
    };
    const reposition = () => { calcPosition(); };

    document.addEventListener('mousedown', close);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', reposition);
    return () => {
      document.removeEventListener('mousedown', close);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open, calcPosition]);

  const years = Array.from({ length: 12 }, (_, i) => pageStart + i).filter(
    y => y >= minYear && y <= maxYear
  );
  const canPrev = pageStart - 12 >= minYear;
  const canNext = pageStart + 12 <= maxYear;

  const handleSelect = (year: number) => {
    onChange(year);
    setOpen(false);
  };

  const handleCurrentYear = () => {
    const approxEthYear = new Date().getFullYear() - 8;
    const clamped = Math.min(Math.max(approxEthYear, minYear), maxYear);
    onChange(clamped);
    setPageStart(Math.floor((clamped - minYear) / 12) * 12 + minYear);
    setOpen(false);
  };

  const dropdown = mounted && open ? createPortal(
    <div
      style={{
        position: 'fixed',
        zIndex: 99999,
        left: pos.left,
        width: Math.max(pos.width, 272),
        ...(pos.top !== undefined ? { top: pos.top } : {}),
        ...(pos.bottom !== undefined ? { bottom: pos.bottom } : {}),
      }}
      className="bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
      onMouseDown={e => e.stopPropagation()} // prevent outside-click close from triggering inside
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#016cc4] text-white">
        <button
          type="button"
          onClick={() => canPrev && setPageStart(p => p - 12)}
          disabled={!canPrev}
          className="p-1.5 rounded-lg hover:bg-white/20 disabled:opacity-30 transition"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-bold tracking-wide select-none">
          {pageStart} – {Math.min(pageStart + 11, maxYear)} E.C.
        </span>
        <button
          type="button"
          onClick={() => canNext && setPageStart(p => p + 12)}
          disabled={!canNext}
          className="p-1.5 rounded-lg hover:bg-white/20 disabled:opacity-30 transition"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Year grid */}
      <div className="grid grid-cols-3 gap-1.5 p-3">
        {years.map(year => (
          <button
            key={year}
            type="button"
            onClick={() => handleSelect(year)}
            className={`
              py-2.5 rounded-xl text-sm font-semibold transition-all duration-100 select-none
              ${year === value
                ? 'bg-[#016cc4] text-white shadow-md shadow-blue-200 scale-105'
                : 'text-gray-700 hover:bg-blue-50 hover:text-[#016cc4]'}
            `}
          >
            {year}
          </button>
        ))}
        {/* fill gaps */}
        {Array.from({ length: 12 - years.length }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}
      </div>

      {/* Quick pick footer */}
      <div className="px-3 pb-3 border-t border-gray-100 pt-2">
        <button
          type="button"
          onClick={handleCurrentYear}
          className="w-full py-2 text-xs font-semibold text-[#016cc4] hover:bg-blue-50 rounded-lg transition"
        >
          Current Ethiopian Year
        </button>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center gap-2 pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white hover:border-[#016cc4] focus:ring-2 focus:ring-[#016cc4] focus:border-[#016cc4] outline-none text-sm text-left relative transition"
      >
        <Calendar
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <span className={value ? 'text-gray-900 font-semibold' : 'text-gray-400'}>
          {value ? `${value} E.C.` : 'Select Ethiopian Year'}
        </span>
      </button>

      {dropdown}
    </div>
  );
}

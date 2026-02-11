'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format,
  startOfDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isAfter,
  isBefore,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  subDays,
  eachDayOfInterval,
} from 'date-fns';
import { cn } from '@/lib/utils';

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  className?: string;
  placeholder?: string;
}

export  const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  className,
  placeholder = 'Select date range',
}) => {
  const today = startOfDay(new Date());
  const defaultEndDate = today;
  const defaultStartDate = subDays(today, 29); // Last 30 days

  // Initialize dates properly
  const initialStartDate = value?.startDate || defaultStartDate;
  const initialEndDate = value?.endDate || defaultEndDate;
  const initialMonth = value?.startDate ? startOfMonth(value.startDate) : new Date();
  const shouldInitializeDefault = !value?.startDate && !value?.endDate;

  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(initialStartDate);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(initialEndDate);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const hasInitializedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set mounted state to prevent hydration mismatch (using setTimeout to avoid sync setState)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Initialize with default 30 days if no value provided (only once on mount)
  useEffect(() => {
    if (!hasInitializedRef.current && shouldInitializeDefault && onChange) {
      hasInitializedRef.current = true;
      const timer = setTimeout(() => {
        onChange({ startDate: defaultStartDate, endDate: defaultEndDate });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [shouldInitializeDefault, defaultStartDate, defaultEndDate, onChange]);

  // Sync with value prop changes (only when value actually changes externally)
  useEffect(() => {
    if (value) {
      const timer = setTimeout(() => {
        setTempStartDate(value.startDate);
        setTempEndDate(value.endDate);
        if (value.startDate) {
          setCurrentMonth(startOfMonth(value.startDate));
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleDateClick = (date: Date) => {
    if (isAfter(date, today)) {
      return; // Don't allow future dates
    }

    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      // Start new selection
      setTempStartDate(date);
      setTempEndDate(null);
    } else if (tempStartDate && !tempEndDate) {
      // Complete the range - always ensure earlier date is start, later date is end
      if (isBefore(date, tempStartDate)) {
        // Selected date is before start date - make it the new start date
        setTempEndDate(tempStartDate);
        setTempStartDate(date);
      } else if (isAfter(date, tempStartDate)) {
        // Selected date is after start date - make it the end date
        setTempEndDate(date);
      } else {
        // Same date selected - clear end date
        setTempEndDate(null);
      }
    }
  };

  const handleApply = () => {
    if (tempStartDate && tempEndDate) {
      // Ensure start date is always before or equal to end date
      let finalStartDate = tempStartDate;
      let finalEndDate = tempEndDate;
      
      if (isAfter(tempStartDate, tempEndDate)) {
        // If start date is after end date, swap them
        finalStartDate = tempEndDate;
        finalEndDate = tempStartDate;
      }
      
      onChange?.({ startDate: finalStartDate, endDate: finalEndDate });
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setTempStartDate(defaultStartDate);
    setTempEndDate(defaultEndDate);
    onChange?.({ startDate: defaultStartDate, endDate: defaultEndDate });
    setIsOpen(false);
  };

  const isDateInRange = (date: Date) => {
    if (!tempStartDate) return false;
    if (tempEndDate) {
      return (
        (isAfter(date, tempStartDate) || isSameDay(date, tempStartDate)) &&
        (isBefore(date, tempEndDate) || isSameDay(date, tempEndDate))
      );
    }
    if (hoverDate && tempStartDate) {
      const start = isBefore(tempStartDate, hoverDate) ? tempStartDate : hoverDate;
      const end = isAfter(tempStartDate, hoverDate) ? tempStartDate : hoverDate;
      return (
        (isAfter(date, start) || isSameDay(date, start)) &&
        (isBefore(date, end) || isSameDay(date, end))
      );
    }
    return isSameDay(date, tempStartDate);
  };

  const isDateSelected = (date: Date) => {
    if (tempStartDate && isSameDay(date, tempStartDate)) return true;
    if (tempEndDate && isSameDay(date, tempEndDate)) return true;
    return false;
  };

  const getMonthDays = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    const next = addMonths(currentMonth, 1);
    // Don't allow going to future months
    if (!isAfter(startOfMonth(next), today)) {
      setCurrentMonth(next);
    }
  };

  const displayText = () => {
    if (value?.startDate && value?.endDate) {
      return `${format(value.startDate, 'dd MMM yyyy')} - ${format(value.endDate, 'dd MMM yyyy')}`;
    }
    if (value?.startDate) {
      return format(value.startDate, 'dd MMM yyyy');
    }
    return placeholder;
  };

  const monthDays = getMonthDays(currentMonth);
  const canGoNext = !isAfter(addMonths(currentMonth, 1), today);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg',
          'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300',
          'hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
          'text-sm cursor-pointer w-full justify-between'
        )}
      >
        <div className="flex items-center gap-2 flex-1">
          <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className={cn(!value?.startDate && 'text-gray-400 dark:text-gray-500')}>
            {displayText()}
          </span>
        </div>
        {isMounted && value?.startDate && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                handleClear();
              }
            }}
          >
            <X className="w-3 h-3" />
          </div>
        )}
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute top-full left-0 mt-2 z-50',
            'bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700',
            'p-4 min-w-[320px] max-h-[500px] overflow-y-auto'
          )}
        >
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Select Date Range
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Select dates from the past (unlimited scroll)
            </p>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={previousMonth}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <h4 className="text-base font-semibold text-gray-900 dark:text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </h4>
            <button
              type="button"
              onClick={nextMonth}
              disabled={!canGoNext}
              className={cn(
                'p-2 rounded-lg transition-colors',
                canGoNext
                  ? 'hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer'
                  : 'opacity-30 cursor-not-allowed'
              )}
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1"
              >
                {day}
              </div>
            ))}
            {monthDays.map((date, index) => {
              const isFuture = isAfter(date, today);
              const isInRange = isDateInRange(date);
              const isSelected = isDateSelected(date);
              const isToday = isSameDay(date, today);
              const isCurrentMonth = isSameMonth(date, currentMonth);

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => !isFuture && handleDateClick(date)}
                  onMouseEnter={() => !isFuture && setHoverDate(date)}
                  disabled={isFuture}
                  className={cn(
                    'h-8 w-8 text-xs rounded-md transition-colors',
                    !isCurrentMonth && 'opacity-30',
                    isFuture && 'opacity-20 cursor-not-allowed',
                    !isFuture && isCurrentMonth && 'hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer',
                    isInRange && !isSelected && isCurrentMonth && 'bg-purple-100 dark:bg-purple-900/30',
                    isSelected &&
                      isCurrentMonth &&
                      'bg-purple-600 dark:bg-purple-600 text-white font-semibold',
                    isToday && !isSelected && isCurrentMonth && 'ring-2 ring-purple-400 dark:ring-purple-500',
                    !isInRange && !isSelected && isCurrentMonth && 'text-gray-700 dark:text-gray-300'
                  )}
                >
                  {format(date, 'd')}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-2 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!tempStartDate || !tempEndDate}
              className={cn(
                'px-4 py-2 text-sm rounded-lg font-medium transition-colors',
                tempStartDate && tempEndDate
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              )}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface DatePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  error?: string | null;
  disabled?: boolean;
  className?: string;
}

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const DAYS_OF_WEEK = ["D", "S", "T", "Q", "Q", "S", "S"];

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = "Selecione uma data",
  error,
  disabled = false,
  className = "",
}: DatePickerProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(value || today);

  const viewMonth = viewDate.getMonth();
  const viewYear = viewDate.getFullYear();

  // Get total days in month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get weekday of 1st day of month (0 = Sun, 6 = Sat)
  const getFirstDayOfWeek = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const handleDaySelect = (day: number, isCurrentMonth: boolean, close: () => void) => {
    let selectedDate: Date;
    if (isCurrentMonth) {
      selectedDate = new Date(viewYear, viewMonth, day);
    } else if (day > 15) {
      // Clicked on previous month padding day
      selectedDate = new Date(viewYear, viewMonth - 1, day);
    } else {
      // Clicked on next month padding day
      selectedDate = new Date(viewYear, viewMonth + 1, day);
    }
    onChange(selectedDate);
    setViewDate(selectedDate);
    close();
  };

  // Generate calendar days grid
  const daysInMonth = getDaysInMonth(viewMonth, viewYear);
  const firstDayOfWeek = getFirstDayOfWeek(viewMonth, viewYear);

  const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
  const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
  const daysInPrevMonth = getDaysInMonth(prevMonth, prevYear);

  const calendarDays: { day: number; isCurrentMonth: boolean }[] = [];

  // Previous month padding days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
    });
  }

  // Next month padding days to complete grid rows
  const remainingSlots = 42 - calendarDays.length; // 6 rows * 7 columns
  for (let i = 1; i <= remainingSlots; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
    });
  }

  const formatDateLabel = (date: Date | null) => {
    if (!date) return placeholder;
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const isSelected = (day: number, isCurrentMonth: boolean) => {
    if (!value) return false;
    const targetMonth = isCurrentMonth ? viewMonth : day > 15 ? viewMonth - 1 : viewMonth + 1;
    const targetYear = viewMonth === 0 && day > 15 && !isCurrentMonth ? viewYear - 1 : viewMonth === 11 && day < 15 && !isCurrentMonth ? viewYear + 1 : viewYear;

    return (
      value.getDate() === day &&
      value.getMonth() === targetMonth &&
      value.getFullYear() === targetYear
    );
  };

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <span className="text-text-secondary text-sm font-medium">{label}</span>
      <Popover className="relative">
        {({ open }) => (
          <>
            <PopoverButton
              disabled={disabled}
              className={`
                w-full bg-secondary rounded-lg py-2.5 pl-9 pr-3 text-left text-sm text-text-heading
                border transition-colors duration-150 outline-none cursor-pointer flex items-center relative
                ${
                  error
                    ? "border-error focus:ring-1 focus:ring-error/30"
                    : "border-border focus:border-border-focus focus:ring-1 focus:ring-border-focus/30"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <CalendarDays className="absolute left-3 w-4 h-4 text-text-muted pointer-events-none" />
              <span className={!value ? "text-text-muted" : ""}>
                {formatDateLabel(value)}
              </span>
            </PopoverButton>

            <PopoverPanel
              transition
              className="absolute z-50 mt-1 w-72 rounded-xl bg-surface border border-border p-4 shadow-xl focus:outline-none transition ease-in duration-100 data-[leave]:data-[closed]:opacity-0"
            >
              {({ close }) => (
                <div className="flex flex-col select-none">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1 rounded-lg hover:bg-surface-hover text-text-primary transition-colors duration-150 cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-semibold text-text-heading">
                      {MONTHS[viewMonth]} {viewYear}
                    </span>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1 rounded-lg hover:bg-surface-hover text-text-primary transition-colors duration-150 cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Days of Week Header */}
                  <div className="grid grid-cols-7 gap-1 text-center mb-1">
                    {DAYS_OF_WEEK.map((day, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-semibold text-text-muted py-1"
                      >
                        {day}
                      </span>
                    ))}
                  </div>

                  {/* Days Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {calendarDays.map((cell, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          handleDaySelect(cell.day, cell.isCurrentMonth, close)
                        }
                        className={`
                          text-xs py-1.5 rounded-lg font-medium transition-colors duration-100 cursor-pointer
                          ${
                            isSelected(cell.day, cell.isCurrentMonth)
                              ? "bg-primary text-white font-semibold"
                              : cell.isCurrentMonth
                              ? "text-text-primary hover:bg-surface-hover"
                              : "text-text-muted opacity-40 hover:bg-surface-hover/50"
                          }
                        `}
                      >
                        {cell.day}
                      </button>
                    ))}
                  </div>

                  {/* Clean value action */}
                  {value && (
                    <button
                      type="button"
                      onClick={() => {
                        onChange(null);
                        close();
                      }}
                      className="mt-3 text-xs font-medium text-error hover:text-error/80 text-center py-1 border-t border-border pt-2 cursor-pointer"
                    >
                      Limpar Data
                    </button>
                  )}
                </div>
              )}
            </PopoverPanel>
          </>
        )}
      </Popover>
      {error && (
        <span className="text-error text-xs animate-[shake_0.4s_ease-in-out]">
          {error}
        </span>
      )}
    </div>
  );
}

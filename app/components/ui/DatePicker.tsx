import { Popover } from "@base-ui/react/popover";
import { useState } from "react";
import { Icon } from "./Icon";

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
  const [open, setOpen] = useState(false);
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

  const handleDaySelect = (day: number, isCurrentMonth: boolean) => {
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
    setOpen(false);
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
      <span className="text-[13px] font-medium text-ink-secondary">{label}</span>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger
          disabled={disabled}
          className={`
                w-full bg-wash rounded-full py-2.5 pl-10 pr-4 text-left text-sm font-medium text-ink-heading
                border transition-colors duration-150 outline-none cursor-pointer flex items-center relative min-w-0
                ${
                  error
                    ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                    : open
                    ? "border-border-focus ring-2 ring-brand/30"
                    : "border-line-input hover:border-ink-muted"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              `}
        >
          <Icon
            name="calendar"
            size={16}
            strokeWidth={1.9}
            className="absolute left-4 text-ink-secondary pointer-events-none shrink-0"
          />
          <span
            className={`block flex-1 min-w-0 truncate whitespace-nowrap ${
              !value ? "text-ink-placeholder" : ""
            }`}
          >
            {formatDateLabel(value)}
          </span>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Positioner side="bottom" align="start" sideOffset={8} className="z-50">
            <Popover.Popup
              className="w-72 rounded-[20px] bg-card border border-line p-4 shadow-lg focus:outline-none origin-[var(--transform-origin)] transition-[opacity,scale] duration-150 ease-out data-starting-style:opacity-0 data-starting-style:scale-[0.96] data-ending-style:opacity-0 data-ending-style:scale-[0.96]"
            >
              <div className="flex flex-col select-none">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-full hover:bg-wash text-chrome-icon transition-colors duration-150 cursor-pointer active:scale-95"
                  >
                    <Icon name="alt-arrow-left" size={16} strokeWidth={2} />
                  </button>
                  <span className="text-sm font-bold text-ink-heading">
                    {MONTHS[viewMonth]} {viewYear}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-full hover:bg-wash text-chrome-icon transition-colors duration-150 cursor-pointer active:scale-95"
                  >
                    <Icon name="alt-arrow-right" size={16} strokeWidth={2} />
                  </button>
                </div>

                {/* Days of Week Header */}
                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {DAYS_OF_WEEK.map((day, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-extrabold uppercase tracking-wider text-ink-label py-1"
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
                      onClick={() => handleDaySelect(cell.day, cell.isCurrentMonth)}
                      className={`
                          w-8 h-8 mx-auto my-0.5 inline-flex items-center justify-center rounded-full text-xs font-medium transition-colors duration-100 cursor-pointer active:scale-95
                          ${
                            isSelected(cell.day, cell.isCurrentMonth)
                              ? "bg-brand-button text-on-brand font-extrabold"
                              : cell.isCurrentMonth
                              ? "text-ink-body hover:bg-wash"
                              : "text-ink-label opacity-50 hover:bg-wash/60"
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
                      setOpen(false);
                    }}
                    className="mt-3 text-xs font-semibold text-error hover:text-error-hover text-center py-1 border-t border-line pt-2 cursor-pointer"
                  >
                    Limpar Data
                  </button>
                )}
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
      {error && (
        <span className="text-error text-xs font-medium animate-[shake_0.4s_ease-in-out]">
          {error}
        </span>
      )}
    </div>
  );
}

import { Popover } from "@base-ui/react/popover";
import { useState } from "react";
import { FieldError } from "./FieldError";
import { Icon } from "./Icon";
import { SECTION_HEADING_CLASS } from "./classes";
import { popupClasses } from "./header-styles";

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

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
}

/** Grade 6×7 do mês (com dias dos meses vizinhos). Pura — sem estado. */
function buildCalendarDays(month: number, year: number): CalendarDay[] {
  const startOffset = new Date(year, month, 1).getDay();
  const start = new Date(year, month, 1 - startOffset);
  const days: CalendarDay[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + i,
    );
    days.push({ date, isCurrentMonth: date.getMonth() === month });
  }
  return days;
}

function isSameDay(a: Date | null, b: Date | null): boolean {
  return (
    !!a &&
    !!b &&
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

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

  // Generate calendar days grid
  const calendarDays = buildCalendarDays(viewMonth, viewYear);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const handleDaySelect = (date: Date) => {
    onChange(date);
    setViewDate(date);
    setOpen(false);
  };

  const formatDateLabel = (date: Date | null) => {
    if (!date) return placeholder;
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const isSelected = (date: Date) => isSameDay(value, date);

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
              className={`w-72 p-4 ${popupClasses}`}
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
                      className={`py-1 ${SECTION_HEADING_CLASS}`}
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
                      onClick={() => handleDaySelect(cell.date)}
                      className={`
                          w-8 h-8 mx-auto my-0.5 inline-flex items-center justify-center rounded-full text-xs font-medium transition-colors duration-100 cursor-pointer active:scale-95
                          ${
                            isSelected(cell.date)
                              ? "bg-brand-button text-on-brand font-extrabold"
                              : cell.isCurrentMonth
                              ? "text-ink-body hover:bg-wash"
                              : "text-ink-label opacity-50 hover:bg-wash/60"
                          }
                        `}
                    >
                      {cell.date.getDate()}
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
      <FieldError message={error} />
    </div>
  );
}

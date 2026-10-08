import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "~/util/cn";
import { mergeRefs } from "~/util/merge-refs";

export interface AutoGrowTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "rows" | "onChange"> {
  minRows?: number;
  maxRows?: number;
  onChange?: (value: string, height: number) => void;
  showCounter?: boolean;
  maxLength?: number;
}

const MIN_HEIGHT = 72;
const ROW_HEIGHT = 24;

export const AutoGrowTextarea = forwardRef<HTMLTextAreaElement, AutoGrowTextareaProps>(
  (
    {
      minRows = 3,
      maxRows = 6,
      onChange,
      showCounter = false,
      maxLength,
      className,
      value,
      disabled,
      placeholder,
      ...props
    },
    ref,
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [height, setHeight] = useState(MIN_HEIGHT);
    const [counter, setCounter] = useState(() =>
      typeof value === "string" ? value.length : 0,
    );
    const [supportsFieldSizing, setSupportsFieldSizing] = useState(false);
    const [isClient, setIsClient] = useState(false);

    const maxHeight = MIN_HEIGHT + (maxRows - minRows) * ROW_HEIGHT;

    const adjustHeight = () => {
      const el = textareaRef.current;
      if (!el) return;

      el.style.height = "auto";
      const scrollHeight = el.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, MIN_HEIGHT), maxHeight);
      setHeight(newHeight);
      el.style.height = `${newHeight}px`;
      el.style.overflowY = newHeight >= maxHeight ? "auto" : "hidden";
    };

    useEffect(() => {
      setIsClient(true);
      setSupportsFieldSizing(CSS.supports("field-sizing", "content"));
    }, []);

    useEffect(() => {
      adjustHeight();
    }, [value, maxRows, minRows]);

    useEffect(() => {
      if (typeof value === "string") setCounter(value.length);
    }, [value]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = event.target.value;
      if (maxLength && newValue.length > maxLength) return;

      setCounter(newValue.length);
      adjustHeight();
      onChange?.(newValue, height);
    };

    const combinedRef = mergeRefs(textareaRef, ref);

    // Filter out onChange from props to avoid TypeScript error
    const restProps = Object.fromEntries(
      Object.entries(props).filter(([key]) => key !== "onChange"),
    ) as React.TextareaHTMLAttributes<HTMLTextAreaElement>;

    return (
      <div className="relative w-full">
        <textarea
          ref={combinedRef}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={maxLength}
          className={cn(
            "w-full bg-card border rounded-2xl px-4 py-2.5 text-sm font-medium text-ink-heading placeholder:text-ink-placeholder outline-none transition-all duration-120 ease-out resize-none",
            "border-line-input focus:border-border-focus focus:ring-2 focus:ring-brand/30",
            disabled && "opacity-50 cursor-not-allowed",
            className,
          )}
          style={{
            height: isClient && supportsFieldSizing ? undefined : height,
            fieldSizing: isClient && supportsFieldSizing ? "content" : undefined,
            minHeight: isClient && supportsFieldSizing ? MIN_HEIGHT : undefined,
            maxHeight: isClient && supportsFieldSizing ? maxHeight : undefined,
          } as React.CSSProperties}
          {...restProps}
        />
        {showCounter && maxLength && (
          <div className="flex items-center justify-end mt-1.5">
            <span className="text-[11px] font-medium text-ink-label">
              {counter}/{maxLength}
            </span>
          </div>
        )}
      </div>
    );
  },
);

AutoGrowTextarea.displayName = "AutoGrowTextarea";
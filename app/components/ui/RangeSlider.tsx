import type { CSSProperties } from "react";

interface RangeSliderProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "value" | "onChange" | "style"
  > {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
}

/**
 * Slider com a parte consumida na cor primária (`--color-brand-button`).
 * O percentual vai para a variável `--slider-fill`, consumida pelo
 * `.slider-primary` em `app.css` (gradiente no webkit, `range-progress`
 * no Firefox). Tokens resolvem em runtime, então funciona em light/dark.
 */
export function RangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  className,
  ...props
}: RangeSliderProps) {
  const percent =
    max > min
      ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
      : 0;

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      style={{ "--slider-fill": `${percent}%` } as CSSProperties}
      className={`slider-primary ${className ?? ""}`}
      {...props}
    />
  );
}

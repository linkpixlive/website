import { Link } from "react-router";

interface LogoTileProps {
  /** When provided, renders the logo as a link (e.g. back to home). */
  href?: string;
  /** Extra classes for the outer wrapper (layout / spacing). */
  className?: string;
  /** Extra classes for the icon <img> (e.g. height overrides). */
  imgClassName?: string;
  /** Extra classes for the wordmark (e.g. size overrides). */
  textClassName?: string;
  /**
   * Which artwork to use:
   * - "light": white icon + white wordmark for dark surfaces (sidebar).
   * - "dark": shell icon + shell wordmark for light surfaces (donations).
   * - "auto": "dark" in light mode, "light" in dark mode.
   */
  variant?: "light" | "dark" | "auto";
}

const ICON_SRC = {
  light: "/icon-dark.svg",
  dark: "/icon.svg",
} as const;

function Wordmark({
  tone,
  iconClassName,
  textClassName,
}: {
  tone: "light" | "dark";
  iconClassName: string;
  textClassName: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <img
        src={ICON_SRC[tone]}
        alt=""
        aria-hidden="true"
        draggable={false}
        className={`h-8 w-auto select-none ${iconClassName}`}
      />
      <span
        className={`font-display text-[22px] font-semibold leading-none tracking-tight ${
          tone === "light" ? "text-white" : "text-shell"
        } ${textClassName}`}
      >
        LinkPix
      </span>
    </span>
  );
}

export function LogoTile({
  href,
  className = "",
  imgClassName = "",
  textClassName = "",
  variant = "light",
}: LogoTileProps) {
  const wrapperClasses = `inline-flex items-center justify-center shrink-0 ${className}`;

  const lockup =
    variant === "auto" ? (
      <>
        <span className="dark:hidden">
          <Wordmark
            tone="dark"
            iconClassName={imgClassName}
            textClassName={textClassName}
          />
        </span>
        <span className="hidden dark:block">
          <Wordmark
            tone="light"
            iconClassName={imgClassName}
            textClassName={textClassName}
          />
        </span>
      </>
    ) : (
      <Wordmark
        tone={variant}
        iconClassName={imgClassName}
        textClassName={textClassName}
      />
    );

  if (href) {
    return (
      <Link
        to={href}
        aria-label="LinkPix"
        className={`${wrapperClasses} outline-none transition-opacity duration-150 hover:opacity-90 cursor-pointer`}
      >
        {lockup}
      </Link>
    );
  }

  return <span className={wrapperClasses}>{lockup}</span>;
}

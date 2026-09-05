/** Shared style for the round header action buttons (theme, notifications). */
export const roundButtonClasses =
  "relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-card border border-line shadow-xs text-chrome-icon transition-colors duration-150 hover:bg-wash hover:text-ink-heading cursor-pointer outline-none active:scale-95";

/** Shared popup animation for anchored header menus (matches DatePicker). */
export const popupClasses =
  "origin-[var(--transform-origin)] rounded-[20px] bg-card border border-line shadow-xl outline-none transition-[opacity,scale] duration-150 ease-out data-starting-style:opacity-0 data-starting-style:scale-[0.96] data-ending-style:opacity-0 data-ending-style:scale-[0.96]";

/** Shared row style for menu items inside header popups. */
export const menuRowClasses =
  "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-body outline-none transition-colors duration-150 data-[highlighted]:bg-wash data-[highlighted]:text-ink-heading";

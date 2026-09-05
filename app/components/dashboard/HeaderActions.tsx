import { Icon } from "~/components/ui/Icon";
import { useTheme } from "~/components/ui/useTheme";
import { NotificationsPopover } from "./NotificationsPopover";
import { ProfilePopover } from "./ProfilePopover";
import { roundButtonClasses } from "./header-styles";

export function HeaderActions() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        type="button"
        aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
        title={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
        onClick={toggleTheme}
        className={roundButtonClasses}
      >
        <Icon name={theme === "dark" ? "sun" : "moon"} size={20} strokeWidth={1.9} />
      </button>

      <NotificationsPopover />
      <ProfilePopover />
    </div>
  );
}

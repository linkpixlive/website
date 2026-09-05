import { Popover } from "@base-ui/react/popover";
import { useState } from "react";
import { Icon, type IconName } from "~/components/ui/Icon";
import { popupClasses, roundButtonClasses } from "./header-styles";

interface AppNotification {
  id: string;
  icon: IconName;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

/** Mock seed — replace with the notifications API once the backend exposes it. */
const initialNotifications: AppNotification[] = [
  {
    id: "donation-maria",
    icon: "wallet",
    title: "Doação recebida",
    description: "Maria Silva te enviou R$ 25,00 via Pix.",
    time: "há 5 min",
    read: false,
  },
  {
    id: "follower-joao",
    icon: "user-circle",
    title: "Novo seguidor",
    description: "João Pereira começou a seguir você.",
    time: "há 1 h",
    read: false,
  },
  {
    id: "widget-meta",
    icon: "widget",
    title: "Widget publicado",
    description: "Seu widget de Meta Final está no ar.",
    time: "há 3 h",
    read: false,
  },
  {
    id: "withdrawal-150",
    icon: "check-circle",
    title: "Saque concluído",
    description: "R$ 150,00 foram enviados para a sua chave Pix.",
    time: "ontem",
    read: true,
  },
];

export function NotificationsPopover() {
  const [notifications, setNotifications] =
    useState<AppNotification[]>(initialNotifications);

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;
  const hasUnread = unreadCount > 0;

  function markAllRead() {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true })),
    );
  }

  return (
    <Popover.Root>
      <Popover.Trigger aria-label="Notificações" title="Notificações" className={roundButtonClasses}>
        <Icon name="bell" size={20} strokeWidth={1.9} />
        {hasUnread && (
          <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[10px] font-extrabold text-on-brand">
            {unreadCount}
          </span>
        )}
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner align="end" sideOffset={8} className="z-50">
          <Popover.Popup className={`w-80 p-3 ${popupClasses}`}>
            <Popover.Title className="px-2 pb-1 pt-1 text-sm font-extrabold text-ink-heading">
              Notificações
            </Popover.Title>

            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-2 py-8 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-wash text-chrome-icon">
                  <Icon name="bell" size={22} strokeWidth={1.9} />
                </span>
                <p className="text-sm font-bold text-ink-heading">Você está em dia!</p>
                <p className="text-xs font-medium text-ink-secondary">
                  Nenhuma notificação por aqui.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className="flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors duration-150 hover:bg-wash"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-wash text-chrome-icon">
                      <Icon name={notification.icon} size={18} strokeWidth={1.9} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-[13px] leading-snug ${
                          notification.read
                            ? "font-semibold text-ink-secondary"
                            : "font-bold text-ink-heading"
                        }`}
                      >
                        {notification.title}
                      </p>
                      <p className="mt-0.5 text-xs font-medium leading-snug text-ink-secondary">
                        {notification.description}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <span className="text-[11px] font-medium text-ink-label">
                        {notification.time}
                      </span>
                      {!notification.read && (
                        <span
                          className="h-2 w-2 rounded-full bg-brand"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {notifications.length > 0 && (
              <div className="mt-2 border-t border-line pt-2">
                <button
                  type="button"
                  onClick={markAllRead}
                  disabled={!hasUnread}
                  className="w-full rounded-xl py-2 text-xs font-bold text-ink-secondary transition-colors duration-150 hover:bg-wash hover:text-ink-heading disabled:cursor-default disabled:opacity-60 disabled:hover:bg-transparent cursor-pointer outline-none active:scale-[0.99]"
                >
                  Marcar todas como lidas
                </button>
              </div>
            )}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

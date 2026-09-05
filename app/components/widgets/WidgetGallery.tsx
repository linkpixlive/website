import { Icon } from "~/components/ui/Icon";

interface WidgetGalleryProps {
  onSelectWidget: (type: string) => void;
}

const AVAILABLE_WIDGETS = [
  {
    type: "overlay",
    name: "Widget de Mensagem",
    description: "Exiba alertas de doações ao vivo com áudio TTS e animações.",
    icon: "chat-dots" as const,
    status: "available", // "available" | "soon"
  },
];

export function WidgetGallery({ onSelectWidget }: WidgetGalleryProps) {
  return (
    <div>
      {/* Title block */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-[26px] font-extrabold tracking-tight leading-tight text-ink-heading">
          Widgets
        </h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Selecione um widget para configurar e integrar à sua{" "}
          <span className="font-bold text-ink-heading">transmissão</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
        {AVAILABLE_WIDGETS.map((widget) => (
          <button
            key={widget.type}
            onClick={() => onSelectWidget(widget.type)}
            className="
              text-left p-5 rounded-[26px] bg-card border border-line shadow-xs
              hover:border-line-input hover:shadow-sm active:scale-[0.98]
              transition-all duration-150 group cursor-pointer outline-none
              focus-visible:ring-2 focus-visible:ring-brand/40 h-full flex flex-col
            "
          >
            <span className="w-12 h-12 rounded-2xl bg-wash flex items-center justify-center mb-4 text-chrome-icon shrink-0">
              <Icon name={widget.icon} size={22} strokeWidth={2} />
            </span>

            <h3 className="text-base font-bold text-ink-heading mb-1">
              {widget.name}
            </h3>
            <p className="text-[13px] text-ink-secondary leading-snug font-medium">
              {widget.description}
            </p>

            <div className="mt-auto pt-4">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-success/10 text-emerald-700">
                Disponível
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

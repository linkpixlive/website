import { MessageSquare } from "lucide-react";
import { PageHeader } from "~/components/dashboard/PageHeader";

interface WidgetGalleryProps {
  onSelectWidget: (type: string) => void;
}

const AVAILABLE_WIDGETS = [
  {
    type: "overlay",
    name: "Widget de Mensagem",
    description: "Exiba alertas de doações ao vivo com áudio TTS e animações.",
    icon: MessageSquare,
    status: "available", // "available" | "soon"
  },
];

export function WidgetGallery({ onSelectWidget }: WidgetGalleryProps) {
  return (
    <>
      <PageHeader
        title="Widgets"
        subtitle="Selecione um widget para configurar e integrar à sua transmissão"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {AVAILABLE_WIDGETS.map((widget) => {
          const Icon = widget.icon;
          return (
            <button
              key={widget.type}
              onClick={() => onSelectWidget(widget.type)}
              className="
                text-left p-6 rounded-2xl bg-surface border border-border
                hover:border-primary/50 hover:bg-surface-hover
                transition-all duration-150 group cursor-pointer outline-none
                focus:ring-1 focus:ring-border-focus/30
              "
            >
              {/* Ícone */}
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Icon className="w-6 h-6 text-primary" />
              </div>

              {/* Texto */}
              <h3 className="text-sm font-semibold text-text-heading mb-1">
                {widget.name}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                {widget.description}
              </p>

              {/* Badge status */}
              <div className="mt-4">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-success/10 text-success">
                  Disponível
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

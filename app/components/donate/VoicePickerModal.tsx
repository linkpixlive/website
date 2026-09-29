import { useState } from "react";
import { Modal } from "~/components/ui/Modal";
import { Icon } from "~/components/ui/Icon";
import { VoiceSampleButton } from "~/components/ui/VoiceSampleButton";

export interface VoiceOption {
  value: string;
  label: string;
  tag: string;
  sampleUrl: string | null;
  imageUrl: string | null;
}

const AVATAR_SIZES = {
  xs: { box: "size-6 rounded-lg", icon: 13 },
  sm: { box: "size-9 rounded-[12px]", icon: 16 },
  md: { box: "size-11 rounded-[14px]", icon: 18 },
} as const;

export function VoiceOptionAvatar({
  imageUrl,
  size = "md",
}: {
  imageUrl: string | null;
  size?: keyof typeof AVATAR_SIZES;
}) {
  const [failed, setFailed] = useState(false);
  const { box, icon } = AVATAR_SIZES[size];

  if (imageUrl && !failed) {
    return (
      <img
        src={imageUrl}
        alt=""
        aria-hidden="true"
        onError={() => setFailed(true)}
        className={`${box} object-cover border border-line shrink-0`}
      />
    );
  }

  return (
    <span className={`flex items-center justify-center ${box} bg-wash shrink-0`}>
      <Icon name="tuning" size={icon} strokeWidth={1.9} className="text-ink-secondary" />
    </span>
  );
}

interface VoicePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: VoiceOption[];
  /** Valor atual já resolvido (inclui a opção padrão). */
  value: string;
  /** Recebe o valor bruto (inclui a opção padrão); fechar fica com o chamador. */
  onSelect: (value: string) => void;
}

export function VoicePickerModal({
  isOpen,
  onClose,
  options,
  value,
  onSelect,
}: VoicePickerModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Escolher voz" size="sm">
      <div role="radiogroup" aria-label="Voz da mensagem" className="flex flex-col gap-1">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <div
              key={option.value}
              role="radio"
              aria-checked={selected}
              aria-label={option.label}
              tabIndex={0}
              onClick={() => onSelect(option.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(option.value);
                }
              }}
              className={`
                relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 outline-none cursor-pointer
                transition-colors duration-150
                hover:bg-wash focus-visible:ring-2 focus-visible:ring-brand/40
                ${selected ? "bg-wash" : ""}
              `}
            >
              <VoiceOptionAvatar imageUrl={option.imageUrl} size="md" />
              <span className="flex-1 min-w-0">
                <span
                  className={`block truncate text-[13px] ${
                    selected ? "font-bold text-ink-heading" : "font-semibold text-ink-body"
                  }`}
                >
                  {option.label}
                </span>
                {option.tag && (
                  <span className="block truncate text-xs font-medium text-ink-muted">
                    {option.tag}
                  </span>
                )}
              </span>
              {option.sampleUrl && (
                <VoiceSampleButton src={option.sampleUrl} voiceName={option.label} />
              )}
              {selected && (
                <span className="shrink-0 h-4 w-4 text-yellow-ink" aria-hidden="true">
                  <Icon name="check-circle" size={16} strokeWidth={2.3} />
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

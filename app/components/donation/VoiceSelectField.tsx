import { useState } from "react";
import { Icon } from "~/components/ui/Icon";
import { FieldError } from "~/components/ui/FieldError";
import {
  VoicePickerModal,
  VoiceOptionAvatar,
  type VoiceOption,
} from "./VoicePickerModal";
import type { TtsVoice } from "~/types/donation";

const DEFAULT_VOICE_VALUE = "default";
const DEFAULT_VOICE_LABEL = "Voz padrão do streamer";
const DEFAULT_VOICE_TAG = "Usa a configuração padrão da live";

interface VoiceSelectFieldProps {
  label?: string;
  voices: TtsVoice[];
  value: string | null;
  onChange: (voiceId: string | null) => void;
  disabled?: boolean;
  error?: string | null;
  hint?: string;
  /**
   * Quando false, omite a pseudo-opção "Voz padrão do streamer" e lista só
   * as vozes reais — usado em /widgets/overlay, onde o streamer escolhe a
   * própria voz padrão (não faria sentido um "padrão do padrão").
   */
  includeDefaultOption?: boolean;
}

function toOption(voice: TtsVoice): VoiceOption {
  return {
    value: voice.id,
    label: voice.name,
    tag: voice.tag,
    sampleUrl: voice.sampleUrl,
    imageUrl: voice.imageUrl,
  };
}

export function VoiceSelectField({
  label = "Voz da mensagem (TTS)",
  voices,
  value,
  onChange,
  disabled,
  error,
  hint = "Escolha a voz que vai ler sua mensagem na live.",
  includeDefaultOption = true,
}: VoiceSelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);

  const options: VoiceOption[] = [
    ...(includeDefaultOption
      ? [
          {
            value: DEFAULT_VOICE_VALUE,
            label: DEFAULT_VOICE_LABEL,
            tag: DEFAULT_VOICE_TAG,
            sampleUrl: null,
            imageUrl: null,
          } satisfies VoiceOption,
        ]
      : []),
    ...voices.map(toOption),
  ];

  if (options.length === 0) {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <span className="text-[13px] font-medium text-ink-secondary">{label}</span>
        <div className="w-full bg-wash rounded-full py-2.5 px-4 text-sm font-medium text-ink-muted border border-line-input opacity-50">
          Nenhuma voz disponível no momento
        </div>
        <FieldError message={error} />
        {hint && <p className="text-xs font-medium text-ink-muted">{hint}</p>}
      </div>
    );
  }

  const currentValue = value ?? options[0].value;
  const current = options.find((option) => option.value === currentValue) ?? options[0];

  function handleSelect(nextValue: string) {
    onChange(nextValue === DEFAULT_VOICE_VALUE ? null : nextValue);
    setIsOpen(false);
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <span className="text-[13px] font-medium text-ink-secondary">{label}</span>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        aria-haspopup="dialog"
        className={`
            w-full bg-wash rounded-full py-2.5 px-4 text-left text-sm font-medium text-ink-heading
            border transition-colors duration-150 outline-none cursor-pointer flex items-center
            ${
              error
                ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                : "border-line-input focus:border-border-focus focus:ring-2 focus:ring-brand/30"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
      >
        <span className="pointer-events-none shrink-0 mr-2.5">
          <VoiceOptionAvatar imageUrl={current.imageUrl} size="xs" />
        </span>
        <span className="flex-1 block truncate">{current.label}</span>
        <span className="text-ink-secondary pointer-events-none shrink-0 ml-2">
          <Icon name="alt-arrow-down" size={16} strokeWidth={1.9} />
        </span>
      </button>

      <VoicePickerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        options={options}
        value={currentValue}
        onSelect={handleSelect}
      />

      <FieldError message={error} />
      {hint && <p className="text-xs font-medium text-ink-muted">{hint}</p>}
    </div>
  );
}

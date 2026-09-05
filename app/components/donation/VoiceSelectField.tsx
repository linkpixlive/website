import { Select } from "@base-ui/react/select";
import { Icon } from "~/components/ui/Icon";
import { FieldError } from "~/components/ui/FieldError";
import { CheckMark } from "~/components/ui/SelectField";
import type { TtsVoice } from "~/types/donation";

const DEFAULT_VOICE_VALUE = "default";
const DEFAULT_VOICE_LABEL = "Voz padrão do streamer";
const DEFAULT_VOICE_TAG = "Usa a configuração padrão da live";

interface VoiceOption {
  value: string;
  label: string;
  tag: string;
}

interface VoiceSelectFieldProps {
  label?: string;
  voices: TtsVoice[];
  value: string | null;
  onChange: (voiceId: string | null) => void;
  disabled?: boolean;
  error?: string | null;
  hint?: string;
}

function toOption(voice: TtsVoice): VoiceOption {
  return { value: voice.id, label: voice.name, tag: voice.tag };
}

export function VoiceSelectField({
  label = "Voz da mensagem (TTS)",
  voices,
  value,
  onChange,
  disabled,
  error,
  hint = "Escolha a voz que vai ler sua mensagem na live.",
}: VoiceSelectFieldProps) {
  const options: VoiceOption[] = [
    { value: DEFAULT_VOICE_VALUE, label: DEFAULT_VOICE_LABEL, tag: DEFAULT_VOICE_TAG },
    ...voices.map(toOption),
  ];
  const currentValue = value ?? DEFAULT_VOICE_VALUE;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <Select.Root
        items={options}
        value={currentValue}
        onValueChange={(newValue) =>
          onChange(newValue === DEFAULT_VOICE_VALUE ? null : (newValue as string))
        }
        disabled={disabled}
      >
        <Select.Label className="text-[13px] font-medium text-ink-secondary">{label}</Select.Label>
        <Select.Trigger
          className={`
              w-full bg-wash rounded-full py-2.5 px-4 text-left text-sm font-medium text-ink-heading
              border transition-colors duration-150 outline-none cursor-pointer flex items-center
              ${
                error
                  ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                  : "border-line focus:border-border-focus focus:ring-2 focus:ring-brand/30"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
        >
          <Icon
            name="tuning"
            size={16}
            strokeWidth={1.9}
            className="text-ink-secondary pointer-events-none shrink-0 mr-2.5"
          />
          <Select.Value className="flex-1 block truncate" />
          <Select.Icon className="text-ink-secondary pointer-events-none shrink-0 ml-2">
            <Icon name="alt-arrow-down" size={16} strokeWidth={1.9} />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Positioner
            alignItemWithTrigger={false}
            sideOffset={8}
            align="start"
            className="z-50 outline-hidden select-none"
          >
            <Select.Popup className="max-h-60 min-w-[var(--anchor-width)] overflow-y-auto rounded-[20px] bg-card border border-line p-2 shadow-lg outline-none origin-[var(--transform-origin)] transition-[opacity,scale] duration-150 ease-out data-starting-style:opacity-0 data-starting-style:scale-[0.96] data-ending-style:opacity-0 data-ending-style:scale-[0.96]">
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className="
                      relative cursor-default select-none rounded-xl outline-none
                      text-[13px] font-semibold text-ink-body
                      data-highlighted:bg-wash
                      data-selected:font-bold data-selected:text-ink-heading
                    "
                >
                  <div className="flex items-center gap-3 py-2.5 pl-3.5 pr-10">
                    <span className="flex items-center justify-center size-9 rounded-full bg-wash shrink-0">
                      <Icon name="tuning" size={16} strokeWidth={1.9} className="text-ink-secondary" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <Select.ItemText className="block truncate">{option.label}</Select.ItemText>
                      <span className="block truncate text-xs font-medium text-ink-muted">
                        {option.tag}
                      </span>
                    </span>
                    <Select.ItemIndicator className="absolute inset-y-0 right-3.5 h-4 w-4 my-auto text-yellow-ink">
                      <CheckMark />
                    </Select.ItemIndicator>
                  </div>
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
      <FieldError message={error} />
      {hint && <p className="text-xs font-medium text-ink-muted">{hint}</p>}
    </div>
  );
}

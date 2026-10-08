import { useState } from "react";
import { AutoGrowTextarea } from "~/components/ui/AutoGrowTextarea";
import { RangeSlider } from "~/components/ui/RangeSlider";
import { ToggleRow } from "~/components/ui/Switch";
import { SECTION_HEADING_CLASS } from "~/components/ui/classes";
import { cn } from "~/util/cn";
import type { DonationSettings } from "~/api/modules/donation-settings";

function MaxLengthField({
  defaultValue,
  disabled,
  onDirtyChange,
}: {
  defaultValue: number;
  disabled: boolean;
  onDirtyChange?: () => void;
}) {
  const [maxLength, setMaxLength] = useState<number>(
    Math.min(defaultValue, 250),
  );
  const sliderMax = 250;

  return (
    <div className="flex max-w-sm flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor="donation-max-length"
          className="text-[13px] font-medium text-ink-secondary"
        >
          Tamanho máximo
        </label>
        <span
          aria-live="polite"
          className="text-sm font-bold text-ink-heading"
        >
          {maxLength} caracteres
        </span>
      </div>
      <RangeSlider
        id="donation-max-length"
        min={0}
        max={sliderMax}
        step={1}
        value={Math.min(maxLength, sliderMax)}
        onChange={(value) => {
          setMaxLength(value);
          onDirtyChange?.();
        }}
        disabled={disabled}
        aria-describedby="donation-max-length-hint"
      />
      <p
        id="donation-max-length-hint"
        className="text-xs font-medium text-ink-muted"
      >
        Limite aplicado à mensagem na página de doação, na fila e no
        overlay (máximo de 250 caracteres).
      </p>
      <input type="hidden" name="maxLength" value={String(maxLength)} />
    </div>
  );
}

export function ModerationSection({
  settings,
  loading,
  customRulesMaxLength,
  onDirtyChange,
}: {
  settings: DonationSettings;
  loading: boolean;
  customRulesMaxLength: number;
  onDirtyChange?: () => void;
}) {
  const [aiModeration, setAiModeration] = useState(
    settings.aiModeration ?? false,
  );
  const [filterProfanity, setFilterProfanity] = useState(
    settings.filterProfanity ?? false,
  );
  const [filterSpam, setFilterSpam] = useState(settings.filterSpam ?? false);
  const [filterHateSpeech, setFilterHateSpeech] = useState(
    settings.filterHateSpeech ?? false,
  );
  const [customRules, setCustomRules] = useState(settings.customRules ?? "");

  const filtersDisabled = loading || !aiModeration;
  const markDirty = () => onDirtyChange?.();

  const filterToggles = [
    {
      name: "filterProfanity",
      label: "Filtrar palavrões",
      description: "Bloqueia palavrões e expressões chulas",
      checked: filterProfanity,
      onToggle: () => {
        setFilterProfanity((v) => !v);
        markDirty();
      },
    },
    {
      name: "filterSpam",
      label: "Filtrar spam",
      description: "Filtra repetições e excesso",
      checked: filterSpam,
      onToggle: () => {
        setFilterSpam((v) => !v);
        markDirty();
      },
    },
    {
      name: "filterHateSpeech",
      label: "Filtrar discurso de ódio",
      description: "Bloqueia racismo, homofobia e intolerância",
      checked: filterHateSpeech,
      onToggle: () => {
        setFilterHateSpeech((v) => !v);
        markDirty();
      },
    },
  ];

  return (
    <section aria-labelledby="donation-moderation-heading">
      <p className={SECTION_HEADING_CLASS}>02 · O que é barrado</p>
      <h2
        id="donation-moderation-heading"
        className="mt-1.5 text-lg font-extrabold tracking-tight text-ink-heading"
      >
        Mensagem e moderação
      </h2>

      <div className="mt-5">
        <MaxLengthField
          defaultValue={settings.maxLength}
          disabled={loading}
          onDirtyChange={markDirty}
        />
      </div>

      <div className="mt-6 border-t border-line pt-2">
        <ToggleRow
          label="Moderação por IA"
          description="Desligada, nada é filtrado — nem as regras personalizadas"
          name="aiModeration"
          checked={aiModeration}
          onToggle={() => {
            setAiModeration((v) => !v);
            markDirty();
          }}
          disabled={loading}
        />

        <div
          aria-disabled={filtersDisabled}
          className={cn(
            "ml-4 pl-2",
            filtersDisabled && "opacity-50",
          )}
        >
          {filterToggles.map((toggle) => (
            <ToggleRow
              key={toggle.name}
              label={toggle.label}
              description={toggle.description}
              name={toggle.name}
              checked={toggle.checked}
              onToggle={toggle.onToggle}
              disabled={filtersDisabled}
            />
          ))}

          <div className="pb-1 pt-1">
            <label
              htmlFor="donation-custom-rules"
              className="block text-[13px] font-semibold text-ink-body leading-tight"
            >
              Regras personalizadas
            </label>
            <p className="block text-xs font-medium text-ink-muted mt-0.5 mb-2">
              Uma palavra por linha e/ou instruções livres. Variações com
              acento, números ou letras repetidas também são detectadas.
            </p>
            {!aiModeration && (
              <input
                type="hidden"
                name="customRules"
                value={customRules}
              />
            )}
            <AutoGrowTextarea
              id="donation-custom-rules"
              name={aiModeration ? "customRules" : undefined}
              value={customRules}
              onChange={(value) => {
                setCustomRules(value);
                markDirty();
              }}
              maxLength={customRulesMaxLength}
              placeholder={"casino\nSem divulgação de outros canais"}
              disabled={filtersDisabled}
              showCounter
              minRows={3}
              maxRows={6}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

import { useState } from "react";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { AutoGrowTextarea } from "~/components/ui/AutoGrowTextarea";
import { RangeSlider } from "~/components/ui/RangeSlider";
import { ToggleRow } from "~/components/ui/Switch";
import { CARD_CLASS, SECTION_HEADING_CLASS } from "~/components/ui/classes";
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

  const handleMaxLengthNumber = (raw: string) => {
    onDirtyChange?.();
    if (raw === "") {
      setMaxLength(0);
      return;
    }
    const value = Number(raw);
    if (Number.isFinite(value)) {
      setMaxLength(Math.min(250, Math.max(0, Math.floor(value))));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor="donation-max-length"
          className="text-[13px] font-medium text-ink-secondary"
        >
          Tamanho máximo
        </label>
        <span className="flex items-center gap-1.5">
          <input
            type="number"
            min={0}
            max={250}
            step={1}
            inputMode="numeric"
            aria-label="Tamanho máximo em caracteres"
            value={maxLength}
            onChange={(event) =>
              handleMaxLengthNumber(event.target.value)
            }
            disabled={disabled}
            className="w-20 rounded-full bg-wash border border-line-input px-3 py-1.5 text-sm font-bold text-ink-heading text-center outline-none transition-colors duration-150 focus:border-border-focus focus:ring-2 focus:ring-brand/30 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <span className="text-xs font-medium text-ink-muted">
            caracteres
          </span>
        </span>
      </div>
      <RangeSlider
        id="donation-max-length"
        min={0}
        max={sliderMax}
        step={10}
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
    <section aria-label="Mensagem e moderação" className={cn(CARD_CLASS, "flex flex-col")}>
      <h2 className={cn(SECTION_HEADING_CLASS, "mb-4")}>Mensagem e moderação</h2>

      <div className="space-y-3.5 flex-1">
        <MaxLengthField
          defaultValue={settings.maxLength}
          disabled={loading}
          onDirtyChange={markDirty}
        />

        <div className="rounded-2xl border border-line bg-wash/40 p-2">
          <ToggleRow
            label="Moderação por IA"
            description="Quando desligada, nenhum filtro é aplicado"
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
            className={
              filtersDisabled ? "opacity-60" : undefined
            }
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

            <div className="px-3.5 pb-2 pt-1">
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
      </div>
    </section>
  );
}

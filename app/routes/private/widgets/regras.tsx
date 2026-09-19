import { useEffect, useRef, useState } from "react";
import { useFetcher, useLoaderData } from "react-router";
import {
  donationSettingsApi,
  type DonationSettings,
} from "~/api/modules/donation-settings";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { AutoGrowTextarea } from "~/components/ui/AutoGrowTextarea";
import { MoneyField } from "~/components/ui/MoneyField";
import { RangeSlider } from "~/components/ui/RangeSlider";
import { SubmitButton } from "~/components/ui/SubmitButton";
import { useToast } from "~/components/ui/useToast";
import { getAuthToken } from "~/util/session.server";
import type { Route } from "./+types/regras";

export function meta() {
  return [
    { title: "Regras — Integrações — LinkPix" },
    {
      name: "description",
      content: "Defina valores mínimos, mensagem e moderação das doações",
    },
  ];
}

const CUSTOM_RULES_MAX_LENGTH = 1000;

const FALLBACK_SETTINGS: DonationSettings = {
  id: "",
  maxLength: 250,
  minAudioAmount: 1,
  minTextAmount: 1,
  aiModeration: false,
  filterProfanity: false,
  filterSpam: false,
  filterHateSpeech: false,
  customRules: "",
  defaultVoiceId: null,
  updatedAt: "",
};

export async function loader({ request }: Route.LoaderArgs) {
  const token = getAuthToken(request);

  let settings = FALLBACK_SETTINGS;
  try {
    const res = await donationSettingsApi.getSettings(token);
    if (res.success) settings = { ...FALLBACK_SETTINGS, ...res.data };
  } catch (err) {
    console.error("Failed to load donation settings:", err);
  }

  return { settings };
}

function parseAmount(raw: FormDataEntryValue | null): number | undefined {
  if (raw === null) return undefined;
  const value = Number(String(raw).replace(",", "."));
  if (!Number.isFinite(value) || value < 1) return undefined;
  return Math.round(value * 100) / 100;
}

function parseMaxLength(raw: FormDataEntryValue | null): number | undefined {
  if (raw === null) return undefined;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) return undefined;
  return value;
}

export async function action({ request }: Route.ActionArgs) {
  const token = getAuthToken(request);
  const formData = await request.formData();

  const minTextAmount = parseAmount(formData.get("minTextAmount"));
  const minAudioAmount = parseAmount(formData.get("minAudioAmount"));
  const maxLength = parseMaxLength(formData.get("maxLength"));

  if (minTextAmount === undefined) {
    return {
      success: false,
      action: "saveDonationSettings",
      error: "Informe um valor mínimo válido para mensagem de texto (R$ 1,00 ou mais).",
    };
  }

  if (minAudioAmount === undefined) {
    return {
      success: false,
      action: "saveDonationSettings",
      error: "Informe um valor mínimo válido para áudio (R$ 1,00 ou mais).",
    };
  }

  if (maxLength === undefined) {
    return {
      success: false,
      action: "saveDonationSettings",
      error: "Informe um tamanho máximo de mensagem válido (0 ou mais).",
    };
  }

  const customRules = String(formData.get("customRules") ?? "");
  if (customRules.length > CUSTOM_RULES_MAX_LENGTH) {
    return {
      success: false,
      action: "saveDonationSettings",
      error: `As regras customizadas devem ter no máximo ${CUSTOM_RULES_MAX_LENGTH} caracteres.`,
    };
  }

  const res = await donationSettingsApi.updateSettings(token, {
    minTextAmount,
    minAudioAmount,
    maxLength,
    aiModeration: formData.get("aiModeration") === "true",
    filterProfanity: formData.get("filterProfanity") === "true",
    filterSpam: formData.get("filterSpam") === "true",
    filterHateSpeech: formData.get("filterHateSpeech") === "true",
    customRules,
  });

  if (!res.success) {
    return {
      success: false,
      action: "saveDonationSettings",
      error: res.error.message,
    };
  }

  return { success: true, action: "saveDonationSettings" };
}

function Switch({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-150 ${
        on ? "bg-brand-button" : "bg-wash border border-line-input"
      }`}
    >
      <span
        className={`absolute h-3.5 w-3.5 rounded-full transition-all duration-150 ${
          on ? "left-[18px] bg-white" : "left-[3px] bg-ink-label"
        }`}
      />
    </span>
  );
}

function FilterToggle({
  label,
  description,
  name,
  on,
  onToggle,
  disabled,
}: {
  label: string;
  description: string;
  name: string;
  on: boolean;
  onToggle: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-3.5 py-2.5">
      <span className="flex-1 min-w-0">
        <span className="block text-[13px] font-semibold text-ink-body leading-tight">
          {label}
        </span>
        <span className="block text-xs font-medium text-ink-muted mt-0.5">
          {description}
        </span>
      </span>
      <input type="hidden" name={name} value={String(on)} />
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={onToggle}
        disabled={disabled}
        className="cursor-pointer outline-none disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Switch on={on} />
      </button>
    </div>
  );
}

export default function DonationSettingsPage() {
  const { settings } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const { toast } = useToast();
  const loading = fetcher.state === "submitting";

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
  const [maxLength, setMaxLength] = useState<number>(settings.maxLength);
  const [formError, setFormError] = useState<string | null>(null);
  const lastHandledResult = useRef<unknown>(null);

  // O slider precisa de um teto; cresce sozinho se um valor legado for maior.
  const sliderMax = Math.max(500, Math.ceil(maxLength / 100) * 100);

  const handleMaxLengthNumber = (raw: string) => {
    if (raw === "") {
      setMaxLength(0);
      return;
    }
    const value = Number(raw);
    if (Number.isFinite(value)) setMaxLength(Math.max(0, Math.floor(value)));
  };

  const filtersDisabled = loading || !aiModeration;

  useEffect(() => {
    if (!fetcher.data || fetcher.data === lastHandledResult.current) return;
    lastHandledResult.current = fetcher.data;

    if (fetcher.data.success) {
      toast("Configurações de doação salvas com sucesso!", "success");
      setFormError(null);
    } else if (fetcher.data.error) {
      setFormError(fetcher.data.error);
    }
  }, [fetcher.data, toast]);

  useEffect(() => {
    if (fetcher.state === "submitting") setFormError(null);
  }, [fetcher.state]);

  return (
    <fetcher.Form
      key={settings.updatedAt}
      method="post"
      className="grid grid-cols-1 gap-5 lg:grid-cols-2 items-stretch"
    >
      <section
        aria-label="Valores mínimos"
        className="rounded-[26px] bg-card border border-line shadow-xs p-5 flex flex-col"
      >
        <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-ink-label mb-4">
          Valores mínimos
        </h2>

        <div className="space-y-3.5 flex-1">
          {formError && <AlertMessage variant="error" message={formError} />}

          <MoneyField
            label="Mensagem de texto"
            name="minTextAmount"
            defaultValue={String(settings.minTextAmount)}
            hint="Abaixo desse valor, doações de texto serão bloqueadas."
            disabled={loading}
          />

          <MoneyField
            label="Narração em áudio"
            name="minAudioAmount"
            defaultValue={String(settings.minAudioAmount)}
            hint="Abaixo desse valor, doações por áudio serão bloqueadas."
            disabled={loading}
          />
        </div>
      </section>

      <section
        aria-label="Mensagem e moderação"
        className="rounded-[26px] bg-card border border-line shadow-xs p-5 flex flex-col"
      >
        <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-ink-label mb-4">
          Mensagem e moderação
        </h2>

        <div className="space-y-3.5 flex-1">
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
                  step={1}
                  inputMode="numeric"
                  aria-label="Tamanho máximo em caracteres"
                  value={maxLength}
                  onChange={(event) =>
                    handleMaxLengthNumber(event.target.value)
                  }
                  disabled={loading}
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
              onChange={setMaxLength}
              disabled={loading}
              aria-describedby="donation-max-length-hint"
            />
            <p
              id="donation-max-length-hint"
              className="text-xs font-medium text-ink-muted"
            >
              Limite aplicado à mensagem na página de doação, na fila e no
              overlay.
            </p>
            <input type="hidden" name="maxLength" value={String(maxLength)} />
          </div>

          <div className="rounded-2xl border border-line bg-wash/40 p-2">
            <FilterToggle
              label="Moderação por IA"
              description="Quando desligada, nenhum filtro é aplicado"
              name="aiModeration"
              on={aiModeration}
              onToggle={() => setAiModeration((v) => !v)}
              disabled={loading}
            />

            <div
              aria-disabled={filtersDisabled}
              className={
                filtersDisabled ? "opacity-60" : undefined
              }
            >
              <FilterToggle
                label="Filtrar palavrões"
                description="Bloqueia palavrões e expressões chulas"
                name="filterProfanity"
                on={filterProfanity}
                onToggle={() => setFilterProfanity((v) => !v)}
                disabled={filtersDisabled}
              />

              <FilterToggle
                label="Filtrar spam"
                description="Filtra repetições e excesso"
                name="filterSpam"
                on={filterSpam}
                onToggle={() => setFilterSpam((v) => !v)}
                disabled={filtersDisabled}
              />

              <FilterToggle
                label="Filtrar discurso de ódio"
                description="Bloqueia racismo, homofobia e intolerância"
                name="filterHateSpeech"
                on={filterHateSpeech}
                onToggle={() => setFilterHateSpeech((v) => !v)}
                disabled={filtersDisabled}
              />

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
                  onChange={setCustomRules}
                  maxLength={CUSTOM_RULES_MAX_LENGTH}
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

      <div className="lg:col-span-2 flex justify-end">
        <SubmitButton
          loading={loading}
          disabled={loading}
          className="w-full sm:w-auto sm:min-w-52"
        >
          Salvar alterações
        </SubmitButton>
      </div>
    </fetcher.Form>
  );
}

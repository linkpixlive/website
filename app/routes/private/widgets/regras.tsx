import { useState } from "react";
import { useFetcher, useLoaderData } from "react-router";
import {
  donationSettingsApi,
  type DonationSettings,
} from "~/api/modules/donation-settings";
import { SubmitButton } from "~/components/ui/SubmitButton";
import { useToast } from "~/contexts/useToast";
import { useUnsavedChanges } from "~/components/ui/UnsavedChangesProvider";
import { MinAmountsSection } from "~/components/widgets/MinAmountsSection";
import { ModerationSection } from "~/components/widgets/ModerationSection";
import { useFetcherFeedback } from "~/hooks/useFetcherFeedback";
import { donationSettingsSchema } from "~/validators/donation-settings-validator";
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

export async function action({ request }: Route.ActionArgs) {
  const token = getAuthToken(request);
  const formData = await request.formData();

  const parsed = donationSettingsSchema.safeParse({
    minTextAmount: formData.get("minTextAmount"),
    minAudioAmount: formData.get("minAudioAmount"),
    maxLength: formData.get("maxLength"),
    aiModeration: formData.get("aiModeration") === "true",
    filterProfanity: formData.get("filterProfanity") === "true",
    filterSpam: formData.get("filterSpam") === "true",
    filterHateSpeech: formData.get("filterHateSpeech") === "true",
    customRules: String(formData.get("customRules") ?? ""),
  });

  if (!parsed.success) {
    return {
      success: false,
      action: "saveDonationSettings",
      error: parsed.error.issues[0].message,
    };
  }

  const res = await donationSettingsApi.updateSettings(token, parsed.data);

  if (!res.success) {
    return {
      success: false,
      action: "saveDonationSettings",
      error: res.error.message,
    };
  }

  return { success: true, action: "saveDonationSettings" };
}

export default function DonationSettingsPage() {
  const { settings } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const { toast } = useToast();
  const loading = fetcher.state === "submitting";

  const [formError, setFormError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  useUnsavedChanges(dirty);

  useFetcherFeedback({
    data: fetcher.data,
    state: fetcher.state,
    onResult: (result) => {
      if (result.success) {
        toast("Configurações de doação salvas com sucesso!", "success");
        setFormError(null);
        setDirty(false);
      } else if (result.error) {
        setFormError(result.error);
      }
    },
    onSubmitting: () => setFormError(null),
  });

  return (
    <fetcher.Form key={settings.updatedAt} method="post">
      <MinAmountsSection
        settings={settings}
        formError={formError}
        loading={loading}
        onDirtyChange={() => setDirty(true)}
      />

      <div aria-hidden="true" className="my-8 border-t border-line" />

      <ModerationSection
        settings={settings}
        loading={loading}
        customRulesMaxLength={CUSTOM_RULES_MAX_LENGTH}
        onDirtyChange={() => setDirty(true)}
      />

        <div className="mt-2 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p
            aria-live="polite"
            className={`text-xs font-semibold ${dirty ? "text-ink-secondary" : "invisible"}`}
          >
            Alterações não salvas
          </p>
          <SubmitButton
            loading={loading}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Salvar
          </SubmitButton>
        </div>
    </fetcher.Form>
  );
}

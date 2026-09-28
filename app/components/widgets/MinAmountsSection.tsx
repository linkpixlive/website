import { AlertMessage } from "~/components/ui/AlertMessage";
import { MoneyField } from "~/components/ui/MoneyField";
import { CARD_CLASS, SECTION_HEADING_CLASS } from "~/components/ui/classes";
import { cn } from "~/util/cn";
import type { DonationSettings } from "~/api/modules/donation-settings";

export function MinAmountsSection({
  settings,
  formError,
  loading,
  onDirtyChange,
}: {
  settings: DonationSettings;
  formError: string | null;
  loading: boolean;
  onDirtyChange?: () => void;
}) {
  return (
    <section aria-label="Valores mínimos" className={cn(CARD_CLASS, "flex flex-col")}>
      <h2 className={cn(SECTION_HEADING_CLASS, "mb-4")}>Valores mínimos</h2>

      <div className="space-y-3.5 flex-1">
        {formError && <AlertMessage variant="error" message={formError} />}

        <MoneyField
          label="Mensagem de texto"
          name="minTextAmount"
          defaultValue={String(settings.minTextAmount)}
          hint="Abaixo desse valor, doações de texto serão bloqueadas."
          disabled={loading}
          onChange={() => onDirtyChange?.()}
        />

        <MoneyField
          label="Narração em áudio"
          name="minAudioAmount"
          defaultValue={String(settings.minAudioAmount)}
          hint="Abaixo desse valor, doações por áudio serão bloqueadas."
          disabled={loading}
          onChange={() => onDirtyChange?.()}
        />
      </div>
    </section>
  );
}

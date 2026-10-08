import { AlertMessage } from "~/components/ui/AlertMessage";
import { MoneyField } from "~/components/ui/MoneyField";
import { SECTION_HEADING_CLASS } from "~/components/ui/classes";
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
    <section aria-labelledby="donation-amounts-heading">
      <p className={SECTION_HEADING_CLASS}>01 · O que chega</p>
      <h2
        id="donation-amounts-heading"
        className="mt-1.5 text-lg font-extrabold tracking-tight text-ink-heading"
      >
        Valores mínimos por tipo
      </h2>

      {formError && (
        <div className="mt-3">
          <AlertMessage variant="error" message={formError} />
        </div>
      )}

      <div className="mt-5 divide-y divide-line/60 border-t border-line">
        <div className="py-4">
          <MoneyField
            label="Mensagem de texto"
            name="minTextAmount"
            defaultValue={String(settings.minTextAmount)}
            hint="Abaixo desse valor, doações de texto serão bloqueadas."
            disabled={loading}
            onChange={() => onDirtyChange?.()}
          />
        </div>
        <div className="py-4">
          <MoneyField
            label="Narração em áudio"
            name="minAudioAmount"
            defaultValue={String(settings.minAudioAmount)}
            hint="Abaixo desse valor, doações por áudio serão bloqueadas."
            disabled={loading}
            onChange={() => onDirtyChange?.()}
          />
        </div>
      </div>
    </section>
  );
}

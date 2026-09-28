interface ConfirmButtonsProps {
  confirmLabel: string;
  cancelLabel: string;
  onCancel: () => void;
  /** Omitido quando o confirmar é `type="submit"` de um `<form>` pai. */
  onConfirm?: () => void;
  loading?: boolean;
  loadingLabel?: string;
}

/** Par perigo/cancelar dos modais de confirmação (excluir, desativar). */
export function ConfirmButtons({
  confirmLabel,
  cancelLabel,
  onCancel,
  onConfirm,
  loading = false,
  loadingLabel,
}: ConfirmButtonsProps) {
  return (
    <div className="flex flex-col gap-2">
      <button
        type={onConfirm ? "button" : "submit"}
        onClick={onConfirm}
        disabled={loading}
        className="w-full px-3 py-2.5 rounded-full bg-error text-white text-[11px] font-bold hover:bg-error-hover active:scale-[0.98] transition-all duration-150 cursor-pointer outline-none disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading && loadingLabel ? loadingLabel : confirmLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="w-full px-3 py-2.5 rounded-full bg-wash text-[11px] font-bold text-ink-body hover:bg-wash-hover active:scale-[0.98] transition-all duration-150 cursor-pointer outline-none disabled:opacity-60"
      >
        {cancelLabel}
      </button>
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { Button } from "~/components/ui/Button";
import { Modal } from "~/components/ui/Modal";
import { getCroppedImage } from "./crop-image";

interface PhotoCropModalProps {
  isOpen: boolean;
  /** Data URL da imagem já escolhida (o picker vive no componente pai). */
  imageSrc: string;
  onClose: () => void;
  /** Reabre o explorador de arquivos do pai para trocar a imagem. */
  onChooseAnother: () => void;
  /** Chamado com o quadrado 512px webp pronto para upload. */
  onExport: (file: File) => void;
  exporting: boolean;
  serverError?: string | null;
}

export function PhotoCropModal({
  isOpen,
  imageSrc,
  onClose,
  onChooseAnother,
  onExport,
  exporting,
  serverError,
}: PhotoCropModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [localError, setLocalError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const croppedPixels = useRef<Area | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      croppedPixels.current = null;
      setLocalError(null);
      setProcessing(false);
    }
  }, [isOpen, imageSrc]);

  const handleSave = useCallback(async () => {
    if (!croppedPixels.current || processing) return;
    setProcessing(true);
    setLocalError(null);
    try {
      const blob = await getCroppedImage(imageSrc, croppedPixels.current);
      onExport(new File([blob], "avatar.webp", { type: "image/webp" }));
    } catch (e) {
      setProcessing(false);
      setLocalError(
        e instanceof Error ? e.message : "Não foi possível ajustar a foto.",
      );
    }
  }, [imageSrc, processing, onExport]);

  const busy = processing || exporting;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajustar foto" size="md">
      {(localError || serverError) && (
        <AlertMessage
          variant="error"
          message={localError ?? serverError ?? ""}
        />
      )}

      <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-shell sm:h-80">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          minZoom={1}
          maxZoom={3}
          onCropChange={setCrop}
          onCropComplete={(_, pixels) => {
            croppedPixels.current = pixels;
          }}
          onZoomChange={setZoom}
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className="text-xs font-bold text-ink-secondary shrink-0">
          Zoom
        </span>
        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          disabled={busy}
          aria-label="Zoom da foto"
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full accent-[var(--color-brand)]"
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={onChooseAnother}
        >
          Trocar imagem
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={busy}
          onClick={() => void handleSave()}
        >
          {busy ? "Salvando…" : "Salvar foto"}
        </Button>
      </div>
    </Modal>
  );
}

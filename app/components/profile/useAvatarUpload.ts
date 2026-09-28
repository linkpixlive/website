import { useRef, useState } from "react";
import { validateAvatarFile } from "~/api/modules/profile";
import { readFileAsDataUrl } from "~/components/profile/crop-image";

/** Picker → crop → upload da foto de perfil (remove incluído). */
export function useAvatarUpload(uploading: boolean) {
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pickerError, setPickerError] = useState<string | null>(null);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** Primeiro clique abre o explorador; o modal só abre após a seleção. */
  const openPicker = () => {
    if (uploading) return;
    setPickerError(null);
    fileInputRef.current?.click();
  };

  const handlePickedFile = async (file: File | undefined) => {
    if (!file) return;
    const invalid = validateAvatarFile(file);
    if (invalid) {
      setPickerError(invalid);
      return;
    }
    try {
      setCropSrc(await readFileAsDataUrl(file));
      setPickerError(null);
      setIsCropOpen(true);
    } catch (e) {
      setPickerError(
        e instanceof Error ? e.message : "Não foi possível ler o arquivo.",
      );
    }
  };

  const closeCropModal = () => {
    if (uploading) return;
    setIsCropOpen(false);
    setCropSrc(null);
  };

  const resetCrop = () => {
    setIsCropOpen(false);
    setCropSrc(null);
    setConfirmingRemove(false);
  };

  return {
    isCropOpen,
    cropSrc,
    pickerError,
    confirmingRemove,
    setConfirmingRemove,
    fileInputRef,
    openPicker,
    handlePickedFile,
    closeCropModal,
    resetCrop,
  };
}

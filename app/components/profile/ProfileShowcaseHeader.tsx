import { useEffect } from "react";
import { useFetcher } from "react-router";
import { PUBLIC_PAGE_BASE } from "~/components/dashboard/menu";
import {
  getUserInitials,
  type LayoutUser,
} from "~/components/dashboard/ProfilePopover";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { Button } from "~/components/ui/Button";
import { Icon } from "~/components/ui/Icon";
import { isSafeMediaUrl } from "~/util/safe-url";
import { PhotoCropModal } from "./PhotoCropModal";
import type { ProfileActionResult } from "./profile-result";
import { useAvatarUpload } from "./useAvatarUpload";
import { useProfileActionFeedback } from "./useProfileActionFeedback";

export function ProfileShowcaseHeader({
  user,
  displayName,
  displayUsername,
  photoUrl,
}: {
  user: LayoutUser;
  displayName: string;
  displayUsername: string;
  photoUrl: string | null;
}) {
  const photoFetcher = useFetcher<ProfileActionResult>();
  const uploading = photoFetcher.state === "submitting";
  const {
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
  } = useAvatarUpload(uploading);

  const photoError = useProfileActionFeedback(photoFetcher, resetCrop);

  const uploadError =
    photoFetcher.data?.action === "uploadPhoto" ? photoError : null;
  const removeError =
    photoFetcher.data?.action === "removePhoto" ? photoError : null;

  useEffect(() => {
    if (photoFetcher.state === "idle") setConfirmingRemove(false);
  }, [photoFetcher.state]);

  const hasPhoto = photoUrl && isSafeMediaUrl(photoUrl);

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label="Escolher imagem de perfil"
        onChange={(e) => {
          void handlePickedFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <div className="flex items-center gap-5">
        <span className="relative shrink-0">
          {hasPhoto ? (
            <img
              src={photoUrl}
              alt="Foto de perfil do streamer"
              className="h-24 w-24 rounded-full object-cover border border-line"
            />
          ) : (
            <span
              aria-hidden="true"
              className="grid h-24 w-24 place-items-center rounded-full bg-brand text-2xl font-extrabold text-on-brand"
            >
              {getUserInitials(displayName || user.name)}
            </span>
          )}
          <button
            type="button"
            title="Trocar foto"
            aria-label="Trocar foto de perfil"
            disabled={uploading}
            onClick={openPicker}
            className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-inverse text-on-inverse shadow-xs outline-none transition-all hover:bg-inverse-hover active:scale-95 disabled:opacity-60 cursor-pointer focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <Icon name="camera-add" size={15} strokeWidth={2} />
          </button>
        </span>
        <div className="min-w-0">
          <p className="truncate text-xl sm:text-2xl font-extrabold tracking-tight leading-tight text-ink-heading">
            {displayName || user.name}
          </p>
          <p className="truncate text-sm font-medium text-ink-muted mt-1">
            {displayUsername ? `@${displayUsername}` : user.email}
          </p>
          {displayUsername && (
            <p className="truncate font-mono text-xs text-ink-muted mt-0.5">
              {PUBLIC_PAGE_BASE}
              {displayUsername}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={uploading}
          onClick={openPicker}
        >
          <Icon name="camera-add" size={16} strokeWidth={1.9} />
          {photoUrl ? "Trocar foto" : "Adicionar foto"}
        </Button>

        {photoUrl &&
          (confirmingRemove ? (
            <>
              <Button
                type="button"
                variant="danger-soft"
                size="sm"
                disabled={uploading}
                onClick={() =>
                  photoFetcher.submit(
                    { intent: "removePhoto" },
                    { method: "post" },
                  )
                }
              >
                Confirmar remoção
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={uploading}
                onClick={() => setConfirmingRemove(false)}
              >
                Cancelar
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={uploading}
              onClick={() => setConfirmingRemove(true)}
            >
              <Icon
                name="trash-bin-minimalistic"
                size={16}
                strokeWidth={1.9}
              />
              Remover foto
            </Button>
          ))}
      </div>

      {removeError && (
        <div className="mt-3 max-w-md">
          <AlertMessage variant="error" message={removeError} />
        </div>
      )}
      {pickerError && (
        <div className="mt-3 max-w-md">
          <AlertMessage variant="error" message={pickerError} />
        </div>
      )}

      <p className="mt-3 text-xs font-medium leading-relaxed text-ink-muted">
        JPG, PNG ou WebP · até 10 MB · você ajusta o enquadramento antes de
        salvar.
      </p>

      {isCropOpen && cropSrc && (
        <PhotoCropModal
          isOpen
          imageSrc={cropSrc}
          exporting={uploading}
          serverError={uploadError}
          onClose={closeCropModal}
          onChooseAnother={openPicker}
          onExport={(file) => {
            const formData = new FormData();
            formData.append("intent", "uploadPhoto");
            formData.append("file", file);
            photoFetcher.submit(formData, {
              method: "post",
              encType: "multipart/form-data",
            });
          }}
        />
      )}
    </div>
  );
}

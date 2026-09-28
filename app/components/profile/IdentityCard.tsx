import { useEffect } from "react";
import { useFetcher } from "react-router";
import { getUserInitials, type LayoutUser } from "~/components/dashboard/ProfilePopover";
import { PhotoCropModal } from "~/components/profile/PhotoCropModal";
import { ProfileCard } from "./ProfileCard";
import { useAvatarUpload } from "./useAvatarUpload";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { Button } from "~/components/ui/Button";
import { Icon } from "~/components/ui/Icon";
import { useProfileActionFeedback } from "./useProfileActionFeedback";
import type { ProfileActionResult } from "./profile-result";

export function IdentityCard({
  user,
  photoUrl,
}: {
  user: LayoutUser;
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

  return (
    <ProfileCard label="Identidade" className="lg:col-span-5 xl:col-span-4">
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
      <div className="rounded-2xl bg-wash p-4 flex items-center gap-3">
        <span className="relative shrink-0">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Foto de perfil do streamer"
              className="h-14 w-14 rounded-full object-cover border border-white shadow-2xs"
            />
          ) : (
            <span
              aria-hidden="true"
              className="grid h-14 w-14 place-items-center rounded-full bg-brand text-[15px] font-extrabold text-on-brand border border-white shadow-2xs"
            >
              {getUserInitials(user.name)}
            </span>
          )}
          <button
            type="button"
            title="Trocar foto"
            aria-label="Trocar foto de perfil"
            disabled={uploading}
            onClick={openPicker}
            className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-inverse text-white shadow-xs outline-none transition-all hover:bg-black active:scale-95 disabled:opacity-60 cursor-pointer focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <Icon name="camera-add" size={14} strokeWidth={2} />
          </button>
        </span>
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-ink-heading leading-tight">
            {user.name}
          </p>
          <p className="truncate text-xs font-medium text-ink-muted mt-0.5">
            {user.username ? `@${user.username}` : user.email}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
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
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="danger-soft"
                size="sm"
                disabled={uploading}
                className="flex-1"
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
            </div>
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

        {removeError && <AlertMessage variant="error" message={removeError} />}
        {pickerError && <AlertMessage variant="error" message={pickerError} />}

        <p className="text-[11px] font-medium leading-relaxed text-ink-muted">
          JPG, PNG ou WebP. Você ajusta o enquadramento antes de salvar.
        </p>
      </div>

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
    </ProfileCard>
  );
}

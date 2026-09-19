import { useEffect, useRef, useState } from "react";
import { useFetcher, useLoaderData } from "react-router";
import type { Route } from "./+types/profile";
import { PageHeader } from "~/components/dashboard/PageHeader";
import { getPublicPageUrl, PUBLIC_PAGE_BASE } from "~/components/dashboard/menu";
import {
  getUserInitials,
  useCurrentUser,
  type LayoutUser,
} from "~/components/dashboard/ProfilePopover";
import { accountSettingsApi } from "~/api/modules/account-settings";
import {
  diffPublicData,
  getUsernameCooldown,
  profileApi,
  validateAvatarFile,
  validateUsernameFormat,
} from "~/api/modules/profile";
import {
  getStreamerByUsername,
} from "~/api/modules/public-donations";
import type { StreamerProfile } from "~/types/donation";
import { PhotoCropModal } from "~/components/profile/PhotoCropModal";
import { readFileAsDataUrl } from "~/components/profile/crop-image";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { Button } from "~/components/ui/Button";
import { FormField } from "~/components/ui/FormField";
import { Icon } from "~/components/ui/Icon";
import { useToast } from "~/components/ui/useToast";
import { requireValidAuth } from "~/util/auth.server";
import { getAuthToken } from "~/util/session.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Perfil — LinkPix" },
    {
      name: "description",
      content: "Gerencie sua foto, nome e username públicos",
    },
  ];
}

interface ProfileActionResult {
  success: boolean;
  action: "savePublicData" | "uploadPhoto" | "removePhoto";
  message?: string;
  error?: string;
  fieldErrors?: { name?: string; username?: string };
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireValidAuth(request);

  let publicProfile: StreamerProfile | null = null;
  if (user?.username) {
    try {
      publicProfile = await getStreamerByUsername(user.username);
    } catch {
      publicProfile = null;
    }
  }

  return { publicProfile };
}

function isUploadableFile(
  value: FormDataEntryValue | null,
): value is File {
  return (
    typeof File !== "undefined" && value instanceof File && value.size > 0
  );
}

export async function action({
  request,
}: Route.ActionArgs): Promise<ProfileActionResult | null> {
  const token = getAuthToken(request);
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");

  if (intent === "savePublicData") {
    const name = String(formData.get("name") ?? "").trim();
    const newUsername = String(formData.get("username") ?? "").trim();
    const fieldErrors: { name?: string; username?: string } = {};

    if (!name) {
      fieldErrors.name = "Informe seu nome.";
    } else if (name.length > 100) {
      fieldErrors.name = "O nome deve ter no máximo 100 caracteres.";
    }
    const usernameInvalid = validateUsernameFormat(newUsername);
    if (usernameInvalid) fieldErrors.username = usernameInvalid;

    if (fieldErrors.name || fieldErrors.username) {
      return { success: false, action: intent, fieldErrors };
    }

    // O backend é a fonte da verdade sobre o que mudou.
    const me = await requireValidAuth(request);
    const { updateName, updateUsername } = diffPublicData(
      { name: me.name ?? "", username: me.username ?? "" },
      { name, username: newUsername },
    );

    if (!updateName && !updateUsername) {
      return {
        success: false,
        action: intent,
        error: "Nenhuma alteração para salvar.",
      };
    }

    if (updateName) {
      const res = await accountSettingsApi.updateProfile(token, { name });
      if (!res.success) {
        return {
          success: false,
          action: intent,
          fieldErrors: { name: res.error.message },
        };
      }
    }

    if (updateUsername) {
      const res = await profileApi.changeUsername(token, newUsername);
      if (!res.success) {
        return {
          success: false,
          action: intent,
          fieldErrors: { username: res.error.message },
          message: updateName
            ? "Nome atualizado, mas o username não pôde ser salvo."
            : undefined,
        };
      }
    }

    return {
      success: true,
      action: intent,
      message: updateUsername
        ? updateName
          ? "Dados atualizados. Seu @ antigo ficou reservado."
          : "Username atualizado. Seu @ antigo ficou reservado."
        : "Nome atualizado.",
    };
  }

  if (intent === "uploadPhoto") {
    const file = formData.get("file");
    if (!isUploadableFile(file)) {
      return {
        success: false,
        action: intent,
        error: "Escolha uma imagem para enviar.",
      };
    }
    const invalid = validateAvatarFile(file);
    if (invalid) {
      return { success: false, action: intent, error: invalid };
    }
    const res = await profileApi.uploadPhoto(token, file);
    if (!res.success) {
      return {
        success: false,
        action: intent,
        error:
          res.error.code === 429
            ? "Muitas tentativas. Aguarde um minuto e tente de novo."
            : res.error.message,
      };
    }
    return { success: true, action: intent, message: "Foto atualizada." };
  }

  if (intent === "removePhoto") {
    const res = await profileApi.removePhoto(token);
    if (!res.success) {
      return { success: false, action: intent, error: res.error.message };
    }
    return { success: true, action: intent, message: "Foto removida." };
  }

  return null;
}

/**
 * Consome o resultado de um fetcher uma única vez: toast de sucesso/erro e
 * repasse do erro para o chamador exibir junto ao campo.
 */
function useProfileActionFeedback(
  fetcher: ReturnType<typeof useFetcher<ProfileActionResult>>,
  onSuccess?: () => void,
) {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const lastHandled = useRef<unknown>(null);

  useEffect(() => {
    if (!fetcher.data || fetcher.data === lastHandled.current) return;
    lastHandled.current = fetcher.data;

    if (fetcher.data.success) {
      setError(null);
      if (fetcher.data.message) toast(fetcher.data.message, "success");
      onSuccess?.();
    } else if (fetcher.data.error) {
      setError(fetcher.data.error);
    }
  }, [fetcher.data, toast, onSuccess]);

  useEffect(() => {
    if (fetcher.state === "submitting") setError(null);
  }, [fetcher.state]);

  return error;
}

function Card({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-label={label}
      className={`rounded-[26px] bg-card border border-line shadow-xs p-5 flex flex-col ${className}`}
    >
      <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-ink-label mb-4">
        {label}
      </h2>
      {children}
    </section>
  );
}

function IdentityCard({
  user,
  photoUrl,
}: {
  user: LayoutUser;
  photoUrl: string | null;
}) {
  const photoFetcher = useFetcher<ProfileActionResult>();
  const uploading = photoFetcher.state === "submitting";
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pickerError, setPickerError] = useState<string | null>(null);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const photoError = useProfileActionFeedback(photoFetcher, () => {
    setIsCropOpen(false);
    setCropSrc(null);
    setConfirmingRemove(false);
  });
  const uploadError =
    photoFetcher.data?.action === "uploadPhoto" ? photoError : null;
  const removeError =
    photoFetcher.data?.action === "removePhoto" ? photoError : null;

  useEffect(() => {
    if (photoFetcher.state === "idle") setConfirmingRemove(false);
  }, [photoFetcher.state]);

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

  return (
    <Card label="Identidade" className="lg:col-span-5 xl:col-span-4">
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
    </Card>
  );
}

function PublicDataCard({ user }: { user: LayoutUser }) {
  const saver = useFetcher<ProfileActionResult>();
  const saving = saver.state === "submitting";
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username ?? "");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    username?: string;
  }>({});
  const { toast } = useToast();
  const lastHandled = useRef<unknown>(null);

  useEffect(() => {
    if (!saver.data || saver.data === lastHandled.current) return;
    lastHandled.current = saver.data;

    if (saver.data.success) {
      setFieldErrors({});
      if (saver.data.message) toast(saver.data.message, "success");
    } else {
      setFieldErrors(saver.data.fieldErrors ?? {});
      toast(
        saver.data.message ??
          saver.data.error ??
          "Não foi possível salvar. Tente novamente.",
        "error",
      );
    }
  }, [saver.data, toast]);

  useEffect(() => {
    if (saver.state === "submitting") setFieldErrors({});
  }, [saver.state]);

  const cooldown = getUsernameCooldown(user.usernameChangedAt);
  const availableLabel = cooldown.availableAt?.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const { updateName, updateUsername } = diffPublicData(
    { name: user.name, username: user.username ?? "" },
    { name, username },
  );
  const hasChanges = updateName || updateUsername;

  return (
    <Card label="Dados públicos" className="lg:col-span-7 xl:col-span-8">
      <form
        className="flex flex-col gap-5 flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          saver.submit(
            {
              intent: "savePublicData",
              name: name.trim(),
              username: username.trim(),
            },
            { method: "post" },
          );
        }}
      >
          <FormField
            name="name"
            label="Nome público"
          icon="user-circle"
          value={name}
          maxLength={100}
          error={fieldErrors.name}
          disabled={saving}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="h-px bg-line" aria-hidden="true" />

        <div className="flex flex-col gap-3">
          <FormField
            name="username"
            label="Username"
            prefix={PUBLIC_PAGE_BASE}
            value={username}
            maxLength={30}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            error={fieldErrors.username}
            disabled={cooldown.locked || saving}
            onChange={(e) => setUsername(e.target.value)}
          />
          {cooldown.locked ? (
            <AlertMessage
              variant="info"
              message={`Você trocou de username recentemente. A próxima troca fica disponível em ${availableLabel} (${cooldown.remainingDays} ${cooldown.remainingDays === 1 ? "dia" : "dias"}).`}
            />
          ) : (
            <p className="-mt-1 text-[11px] font-medium leading-relaxed text-ink-muted">
              Letras, números e underline (_), 3 a 30 caracteres. Após a troca
              há uma carência de 15 dias e seu @ antigo fica reservado.
            </p>
          )}
        </div>

        <div className="mt-auto pt-2 flex justify-end">
          <Button
            type="submit"
            size="sm"
            loading={saving}
            disabled={saving || !hasChanges}
          >
            Salvar
          </Button>
        </div>
      </form>
    </Card>
  );
}

function PublicPageCard({
  user,
  publicProfile,
}: {
  user: LayoutUser;
  publicProfile: StreamerProfile | null;
}) {
  const username = user.username;
  const photoUrl =
    publicProfile?.profileImageUrl ?? user.profileImageUrl ?? null;

  return (
    <Card label="Minha página" className="lg:col-span-12">
      {username ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <img
              src={photoUrl ?? "/default-avatar.svg"}
              alt="Prévia da foto na página pública"
              className="h-12 w-12 shrink-0 rounded-full object-cover border border-line"
            />
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 truncate text-sm font-bold text-ink-heading">
                {publicProfile?.name ?? user.name}
                {publicProfile?.verified && (
                  <Icon
                    name="check-circle"
                    size={15}
                    strokeWidth={2}
                    className="shrink-0 text-info"
                    aria-label="Conta verificada"
                  />
                )}
              </p>
              <p className="truncate text-xs font-medium text-ink-muted mt-0.5">
                {PUBLIC_PAGE_BASE}{username}
              </p>
            </div>
          </div>
          <a
            href={getPublicPageUrl(username)}
            target="_blank"
            rel="noreferrer"
            title="Ver página pública (abre em nova aba)"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-wash px-4 h-10 text-xs font-bold text-ink-body transition-all duration-150 outline-none hover:bg-wash-hover active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand/40 cursor-pointer"
          >
            <Icon name="square-arrow-right-up" size={16} strokeWidth={1.9} />
            Ver página
          </a>
        </div>
      ) : (
        <p className="text-[13px] font-medium text-ink-secondary">
          Defina seu username acima para ativar sua página pública de doações.
        </p>
      )}
    </Card>
  );
}

export default function Profile() {
  const { publicProfile } = useLoaderData<typeof loader>();
  const user = useCurrentUser();

  if (!user) return null;

  return (
    <div>
      <PageHeader
        title="Perfil"
        subtitle={
          <>
            Gerencie sua{" "}
            <strong className="font-bold text-ink-heading">
              foto, nome e username
            </strong>{" "}
            públicos.
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-stretch">
        <IdentityCard
          key={`identity-${user.profileImageUrl ?? "none"}`}
          user={user}
          photoUrl={user.profileImageUrl ?? null}
        />
        <PublicDataCard
          key={`data-${user.name}-${user.username ?? "none"}`}
          user={user}
        />
        <PublicPageCard user={user} publicProfile={publicProfile} />
      </div>
    </div>
  );
}

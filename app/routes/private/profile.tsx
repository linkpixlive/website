import { useState } from "react";
import type { Route } from "./+types/profile";
import { PageHeader } from "~/components/dashboard/PageHeader";
import { useCurrentUser } from "~/components/dashboard/ProfilePopover";
import { accountSettingsApi } from "~/api/modules/account-settings";
import { profileApi } from "~/api/modules/profile";
import {
  diffPublicData,
  validateAvatarFile,
  validateUsernameFormat,
} from "~/validators/profile-validator";
import { ProfileEditForm } from "~/components/profile/ProfileEditForm";
import { ProfileShowcaseHeader } from "~/components/profile/ProfileShowcaseHeader";
import type { ProfileActionResult } from "~/components/profile/profile-result";
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
  const handler = intentHandlers[String(formData.get("intent") ?? "")];
  return handler ? handler(token, formData, request) : null;
}

type ProfileIntentHandler = (
  token: string | null,
  formData: FormData,
  request: Request,
) => Promise<ProfileActionResult>;

const intentHandlers: Record<string, ProfileIntentHandler> = {
  savePublicData: async (token, formData, request) => {
    const name = String(formData.get("name") ?? "").trim();
    const newUsername = String(formData.get("username") ?? "").trim();
    const me = await requireValidAuth(request);
    return savePublicDataAction(
      token,
      { name: me.name ?? "", username: me.username ?? "" },
      { name, username: newUsername },
    );
  },

  uploadPhoto: (token, formData) =>
    uploadPhotoAction(token, formData.get("file")),

  removePhoto: async (token) => {
    const res = await profileApi.removePhoto(token);
    if (!res.success) return fail("removePhoto", res.error.message);
    return ok("removePhoto", "Foto removida.");
  },
};

type ProfileIntent = ProfileActionResult["action"];

function fail(
  action: ProfileIntent,
  error: string,
  extra?: Partial<ProfileActionResult>,
): ProfileActionResult {
  return { success: false, action, error, ...extra };
}

function invalid(
  action: ProfileIntent,
  fieldErrors: NonNullable<ProfileActionResult["fieldErrors"]>,
  extra?: Partial<ProfileActionResult>,
): ProfileActionResult {
  return { success: false, action, fieldErrors, ...extra };
}

function ok(action: ProfileIntent, message: string): ProfileActionResult {
  return { success: true, action, message };
}

async function savePublicDataAction(
  token: string | null,
  current: { name: string; username: string },
  next: { name: string; username: string },
): Promise<ProfileActionResult> {
  const intent = "savePublicData";
  const fieldErrors: { name?: string; username?: string } = {};

  if (!next.name) {
    fieldErrors.name = "Informe seu nome.";
  } else if (next.name.length > 100) {
    fieldErrors.name = "O nome deve ter no máximo 100 caracteres.";
  }
  const usernameInvalid = validateUsernameFormat(next.username);
  if (usernameInvalid) fieldErrors.username = usernameInvalid;

  if (fieldErrors.name || fieldErrors.username) {
    return invalid(intent, fieldErrors);
  }

  const { updateName, updateUsername } = diffPublicData(current, next);

  if (!updateName && !updateUsername) {
    return fail(intent, "Nenhuma alteração para salvar.");
  }

  if (updateName) {
    const res = await accountSettingsApi.updateProfile(token, { name: next.name });
    if (!res.success) {
      return invalid(intent, { name: res.error.message });
    }
  }

  if (updateUsername) {
    const res = await profileApi.changeUsername(token, next.username);
    if (!res.success) {
      return invalid(
        intent,
        { username: res.error.message },
        {
          message: updateName
            ? "Nome atualizado, mas o username não pôde ser salvo."
            : undefined,
        },
      );
    }
  }

  return ok(intent, pickSaveMessage(updateName, updateUsername));
}

function pickSaveMessage(updateName: boolean, updateUsername: boolean): string {
  if (updateName && updateUsername)
    return "Dados atualizados. Seu @ antigo ficou reservado.";
  if (updateUsername)
    return "Username atualizado. Seu @ antigo ficou reservado.";
  return "Nome atualizado.";
}

async function uploadPhotoAction(
  token: string | null,
  file: FormDataEntryValue | null,
): Promise<ProfileActionResult> {
  const intent = "uploadPhoto";
  if (!isUploadableFile(file)) {
    return fail(intent, "Escolha uma imagem para enviar.");
  }
  const invalidAvatar = validateAvatarFile(file);
  if (invalidAvatar) {
    return fail(intent, invalidAvatar);
  }
  const res = await profileApi.uploadPhoto(token, file);
  if (!res.success) {
    return fail(
      intent,
      res.error.code === 429
        ? "Muitas tentativas. Aguarde um minuto e tente de novo."
        : res.error.message,
    );
  }
  return ok(intent, "Foto atualizada.");
}

export default function Profile() {
  const user = useCurrentUser();
  const [name, setName] = useState(user?.name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");

  if (!user) return null;

  const displayName = name.trim() || user.name;
  const displayUsername = username.trim();
  const photoUrl = user.profileImageUrl ?? null;

  return (
    <div>
      <PageHeader
        title="Perfil"
        subtitle="Os dados que aparecem na sua página de contribuições."
      />

      <ProfileShowcaseHeader
        user={user}
        displayName={displayName}
        displayUsername={displayUsername}
        photoUrl={photoUrl}
      />

      <div className="my-8 h-px bg-line" aria-hidden="true" />

      <div className="max-w-2xl">
        <ProfileEditForm
          user={user}
          name={name}
          setName={setName}
          username={username}
          setUsername={setUsername}
        />
      </div>
    </div>
  );
}

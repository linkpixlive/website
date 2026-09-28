import { useLoaderData } from "react-router";
import type { Route } from "./+types/profile";
import { PageHeader } from "~/components/dashboard/PageHeader";
import { useCurrentUser } from "~/components/dashboard/ProfilePopover";
import { accountSettingsApi } from "~/api/modules/account-settings";
import {
  diffPublicData,
  profileApi,
  validateAvatarFile,
  validateUsernameFormat,
} from "~/api/modules/profile";
import {
  getStreamerByUsername,
} from "~/api/modules/public-donations";
import { IdentityCard } from "~/components/profile/IdentityCard";
import { PublicDataCard } from "~/components/profile/PublicDataCard";
import { PublicPageCard } from "~/components/profile/PublicPageCard";
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

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireValidAuth(request);

  let publicProfile: Awaited<ReturnType<typeof getStreamerByUsername>> = null;
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
    // O backend é a fonte da verdade sobre o que mudou.
    const me = await requireValidAuth(request);
    return savePublicDataAction(
      token,
      { name: me.name ?? "", username: me.username ?? "" },
      { name, username: newUsername },
    );
  }

  if (intent === "uploadPhoto") {
    return uploadPhotoAction(token, formData.get("file"));
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
    return { success: false, action: intent, fieldErrors };
  }

  const { updateName, updateUsername } = diffPublicData(current, next);

  if (!updateName && !updateUsername) {
    return {
      success: false,
      action: intent,
      error: "Nenhuma alteração para salvar.",
    };
  }

  if (updateName) {
    const res = await accountSettingsApi.updateProfile(token, { name: next.name });
    if (!res.success) {
      return {
        success: false,
        action: intent,
        fieldErrors: { name: res.error.message },
      };
    }
  }

  if (updateUsername) {
    const res = await profileApi.changeUsername(token, next.username);
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

async function uploadPhotoAction(
  token: string | null,
  file: FormDataEntryValue | null,
): Promise<ProfileActionResult> {
  const intent = "uploadPhoto";
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
        <PublicDataCard user={user} />
        <PublicPageCard user={user} publicProfile={publicProfile} />
      </div>
    </div>
  );
}

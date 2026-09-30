import { useState } from "react";
import { useFetcher } from "react-router";
import { PUBLIC_PAGE_BASE } from "~/components/dashboard/menu";
import type { LayoutUser } from "~/components/dashboard/ProfilePopover";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { Button } from "~/components/ui/Button";
import { FormField } from "~/components/ui/FormField";
import { useToast } from "~/contexts/useToast";
import { useUnsavedChanges } from "~/components/ui/UnsavedChangesProvider";
import {
  diffPublicData,
  getUsernameCooldown,
} from "~/validators/profile-validator";
import { useFetcherFeedback } from "~/hooks/useFetcherFeedback";
import { ProfileCard } from "./ProfileCard";
import type { ProfileActionResult } from "./profile-result";

export function PublicDataCard({ user }: { user: LayoutUser }) {
  const saver = useFetcher<ProfileActionResult>();
  const saving = saver.state === "submitting";
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username ?? "");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    username?: string;
  }>({});
  const { toast } = useToast();

  useFetcherFeedback({
    data: saver.data,
    state: saver.state,
    onResult: (result) => {
      if (result.success) {
        setFieldErrors({});
        if (result.message) toast(result.message, "success");
      } else {
        setFieldErrors(result.fieldErrors ?? {});
        toast(
          result.message ??
            result.error ??
            "Não foi possível salvar. Tente novamente.",
          "error",
        );
      }
    },
    onSubmitting: () => setFieldErrors({}),
  });

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
  useUnsavedChanges(hasChanges);

  return (
    <ProfileCard label="Dados públicos" className="lg:col-span-7 xl:col-span-8">
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
    </ProfileCard>
  );
}

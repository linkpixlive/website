import { useState } from "react";
import { useFetcher } from "react-router";
import { PUBLIC_PAGE_BASE } from "~/components/dashboard/menu";
import type { LayoutUser } from "~/components/dashboard/ProfilePopover";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { Button } from "~/components/ui/Button";
import { SECTION_HEADING_CLASS } from "~/components/ui/classes";
import { FormField } from "~/components/ui/FormField";
import { useUnsavedChanges } from "~/components/ui/UnsavedChangesProvider";
import { useToast } from "~/contexts/useToast";
import { useFetcherFeedback } from "~/hooks/useFetcherFeedback";
import { cn } from "~/util/cn";
import {
  diffPublicData,
  getUsernameCooldown,
} from "~/validators/profile-validator";
import type { ProfileActionResult } from "./profile-result";

export function ProfileEditForm({
  user,
  name,
  setName,
  username,
  setUsername,
}: {
  user: LayoutUser;
  name: string;
  setName: (value: string) => void;
  username: string;
  setUsername: (value: string) => void;
}) {
  const saver = useFetcher<ProfileActionResult>();
  const saving = saver.state === "submitting";
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
    <section aria-label="Dados públicos" className="flex flex-col">
      <h2 className={cn(SECTION_HEADING_CLASS, "mb-5")}>Dados públicos</h2>
      <form
        className="flex flex-col gap-5"
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
            <p className="-mt-1 text-xs font-medium leading-relaxed text-ink-muted">
              Letras, números e underline (_), 3 a 30 caracteres. Após a troca
              há uma carência de 15 dias e seu @ antigo fica reservado.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <p aria-live="polite" className="min-h-4 text-xs font-medium text-ink-muted">
            {hasChanges ? "Alterações não salvas" : ""}
          </p>
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
    </section>
  );
}

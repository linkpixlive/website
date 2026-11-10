import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { Link, redirect, useNavigation, useSubmit } from "react-router";
import { z } from "zod";
import { authApi } from "~/api/modules/auth";
import { AuthShell } from "~/components/auth/AuthShell";
import { PasswordField } from "~/components/auth/PasswordField";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { FormField } from "~/components/ui/FormField";
import { SubmitButton } from "~/components/ui/SubmitButton";
import { useActionError } from "~/hooks/useActionError";
import { formatCpf } from "~/util/cpf";
import {
  completeRegistrationSchema,
  registerInitSchema,
  registerSchema,
} from "~/validators/auth-validator";
import { getPasswordStrength } from "~/validators/password";
import { createAuthCookie } from "~/util/session.server";
import type { Route } from "./+types/register-complete";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Finalize seu cadastro — LinkPix" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const emailCandidate = url.searchParams.get("email") ?? "";
  const usernameCandidate = url.searchParams.get("username") ?? "";

  const parsedEmail = registerInitSchema.shape.email.safeParse(emailCandidate);
  if (!parsedEmail.success) {
    throw redirect("/auth/register");
  }

  const parsedUsername = registerSchema.shape.username.safeParse(
    usernameCandidate,
  );
  return {
    email: parsedEmail.data,
    initialUsername: parsedUsername.success ? parsedUsername.data : "",
  };
}

export async function action({ request }: Route.ActionArgs) {
  const url = new URL(request.url);
  const parsedEmail = registerInitSchema.shape.email.safeParse(
    url.searchParams.get("email") ?? "",
  );
  if (!parsedEmail.success) {
    return { error: "Confirmação de e-mail não encontrada. Comece novamente." };
  }

  const formData = await request.formData();
  const parsed = completeRegistrationSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    username: String(formData.get("username") ?? ""),
    cpf: String(formData.get("cpf") ?? "").replace(/\D/g, ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { confirmPassword: _confirmPassword, ...registration } = parsed.data;

  const result = await authApi.register({
    ...registration,
    email: parsedEmail.data,
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  return redirect("/dashboard", {
    headers: { "Set-Cookie": createAuthCookie(result.data) },
  });
}

type CompleteFormValues = z.infer<typeof completeRegistrationSchema>;

type Step = 1 | 2 | 3;

const STEP_FIELDS: Record<Exclude<Step, 3>, (keyof CompleteFormValues)[]> = {
  1: ["username"],
  2: ["name", "cpf"],
};

function stepForApiError(message: string): Step {
  const msg = message.toLowerCase();
  if (msg.includes("usuário") || msg.includes("username")) return 1;
  if (msg.includes("senha") || msg.includes("password")) return 3;
  return 2;
}

export default function RegisterComplete({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const loading = navigation.state === "submitting";
  const [apiError, clearApiError] = useActionError(actionData);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [validatingUsername, setValidatingUsername] = useState(false);
  const [step, setStep] = useState<Step>(
    loaderData.initialUsername ? 2 : 1,
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    setFocus,
    clearErrors,
    formState: { errors },
  } = useForm<CompleteFormValues>({
    resolver: zodResolver(completeRegistrationSchema),
    defaultValues: { username: loaderData.initialUsername },
  });

  const passwordValue = watch("password");
  const cpfValue = watch("cpf") || "";

  const [hostPrefix, setHostPrefix] = useState("");
  useEffect(() => {
    setHostPrefix(`${window.location.host}/`);
  }, []);

  useEffect(() => {
    if (step === 1) setFocus("username");
    else if (step === 2) setFocus("name");
    else setFocus("password");
  }, [step, setFocus]);

  useEffect(() => {
    if (apiError && !apiError.includes("Confirme seu e-mail")) {
      setStep(stepForApiError(apiError));
    }
  }, [apiError]);

  const handleNext = async (fields: (keyof CompleteFormValues)[]) => {
    if (validatingUsername) return;
    clearApiError();
    setAvailabilityError(null);
    if (!(await trigger(fields))) return;
    clearErrors();

    if (step === 1) {
      setValidatingUsername(true);
      const result = await authApi.validateUsername(watch("username"));
      setValidatingUsername(false);
      if (!result.success) {
        setAvailabilityError(result.error.message);
        return;
      }
    }

    setStep((current) =>
      current < 3 ? ((current + 1) as Step) : current,
    );
  };

  const onSubmit = (data: CompleteFormValues) => {
    clearApiError();
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("username", data.username);
    formData.append("cpf", data.cpf.replace(/\D/g, ""));
    formData.append("password", data.password);
    formData.append("confirmPassword", data.confirmPassword);
    submit(formData, { method: "post" });
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step !== 3) {
      void handleNext(STEP_FIELDS[step]);
      return;
    }
    void handleSubmit(onSubmit)(event);
  };

  const emailConfirmationError = apiError?.includes("Confirme seu e-mail");

  return (
    <AuthShell
      eyebrow="Criar conta"
      title="Finalize seu cadastro"
      lede={
        <>
          E-mail confirmado:{" "}
          <span className="font-semibold text-ink-heading">{loaderData.email}</span>{" "}
          ·{" "}
          <Link
            to="/auth/register"
            className="font-semibold text-info hover:text-info-hover underline transition-colors duration-150"
          >
            usar outro e-mail
          </Link>
        </>
      }
      aside={{ to: "/auth/login", label: "Entrar" }}
    >
      <form
        onSubmit={handleFormSubmit}
        onChange={() => {
          clearApiError();
          setAvailabilityError(null);
        }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <p className="text-xs font-semibold text-ink-muted">Etapa {step} de 3</p>
          <div className="flex gap-1.5" aria-hidden="true">
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full ${i <= step ? "bg-ink-heading" : "bg-line"}`}
              />
            ))}
          </div>
        </div>

        {(apiError || availabilityError) && (
          <AlertMessage
            variant="error"
            message={availabilityError ?? apiError ?? ""}
          />
        )}

        {emailConfirmationError && (
          <div className="text-center">
            <Link
              to="/auth/register"
              className="text-[13px] font-semibold text-info hover:text-info-hover underline transition-colors duration-150"
            >
              Começar novamente
            </Link>
          </div>
        )}

        {step === 1 && (
          <div key="step-1" className="space-y-4 animate-fade-in">
            <FormField
              label="Usuário"
              {...register("username")}
              error={errors.username?.message ?? availabilityError ?? undefined}
              prefix={hostPrefix || undefined}
              disabled={loading || validatingUsername}
              autoFocus
            />

            <div className="mt-6">
              <SubmitButton
                type="button"
                disabled={validatingUsername}
                onClick={() => handleNext(STEP_FIELDS[1])}
              >
                {validatingUsername ? "Validando..." : "Continuar"}
              </SubmitButton>
            </div>
          </div>
        )}

        {step === 2 && (
          <div key="step-2" className="space-y-4 animate-fade-in">
            <FormField
              label="Nome"
              {...register("name")}
              error={errors.name?.message}
              icon="user"
              disabled={loading}
            />

            <div className="space-y-1.5">
              <FormField
                label="CPF"
                {...register("cpf")}
                value={formatCpf(cpfValue)}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 11);
                  setValue("cpf", val, {
                    shouldDirty: true,
                    shouldValidate: val.length === 11,
                  });
                }}
                error={errors.cpf?.message}
                icon="card"
                placeholder="000.000.000-00"
                inputMode="numeric"
                disabled={loading}
              />
              {!errors.cpf?.message && (
                <p className="text-xs font-medium text-ink-muted">
                  Usado para liberar seus saques via Pix.
                </p>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <SubmitButton type="button" onClick={() => handleNext(STEP_FIELDS[2])}>
                Continuar
              </SubmitButton>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[13px] font-semibold text-info hover:text-info-hover transition-colors duration-150"
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div key="step-3" className="space-y-4 animate-fade-in">
            <PasswordField
              label="Senha"
              {...register("password")}
              error={errors.password?.message}
              icon="lock"
              placeholder="Crie uma senha forte"
              disabled={loading}
              showStrength
              strengthScore={getPasswordStrength(passwordValue || "")}
            />

            <PasswordField
              label="Confirmar Senha"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
              icon="lock"
              placeholder="Confirme sua senha"
              disabled={loading}
            />

            <div className="mt-6 space-y-3">
              <SubmitButton loading={loading}>Criar conta</SubmitButton>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-[13px] font-semibold text-info hover:text-info-hover transition-colors duration-150"
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </AuthShell>
  );
}

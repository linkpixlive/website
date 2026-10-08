import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, redirect, useNavigation, useSubmit } from "react-router";
import { z } from "zod";
import { authApi } from "~/api/modules/auth";
import { AuthSplit } from "~/components/auth/AuthSplit";
import { PasswordField } from "~/components/auth/PasswordField";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { FormField } from "~/components/ui/FormField";
import { SubmitButton } from "~/components/ui/SubmitButton";
import { useActionError } from "~/hooks/useActionError";
import { formatCpf } from "~/util/cpf";
import { registerSchema } from "~/validators/auth-validator";
import { getPasswordStrength } from "~/validators/password";
import type { Route } from "./+types/register";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Criar conta — LinkPix" }];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const parsed = registerSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    username: String(formData.get("username") ?? ""),
    email: String(formData.get("email") ?? ""),
    cpf: String(formData.get("cpf") ?? "").replace(/\D/g, ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, username, email, password, cpf } = parsed.data;
  const result = await authApi.register({ name, username, email, password, cpf });

  if (!result.success) {
    return { error: result.error.message };
  }

  return redirect(`/auth/verify-email?email=${encodeURIComponent(email)}`);
}

type RegisterFormValues = z.infer<typeof registerSchema>;

type Step = 1 | 2 | 3;

const STEP_FIELDS: Record<Exclude<Step, 3>, (keyof RegisterFormValues)[]> = {
  1: ["username"],
  2: ["name", "email", "cpf"],
};

function stepForApiError(message: string): Step {
  const msg = message.toLowerCase();
  if (msg.includes("usuário") || msg.includes("username")) return 1;
  if (msg.includes("senha") || msg.includes("password")) return 3;
  return 2;
}

export default function Register({ actionData }: Route.ComponentProps) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const loading = navigation.state === "submitting";
  const [apiError, clearApiError] = useActionError(actionData);
  const [step, setStep] = useState<Step>(1);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    setFocus,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
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
    if (apiError) setStep(stepForApiError(apiError));
  }, [apiError]);

  const handleNext = async (fields: (keyof RegisterFormValues)[]) => {
    clearApiError();
    if (await trigger(fields)) setStep((s) => (s < 3 ? ((s + 1) as Step) : s));
  };

  const onSubmit = (data: RegisterFormValues) => {
    clearApiError();
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("cpf", data.cpf.replace(/\D/g, ""));
    formData.append("password", data.password);
    formData.append("confirmPassword", data.confirmPassword);
    submit(formData, { method: "post" });
  };

  return (
    <AuthSplit
      tone="register"
      eyebrow="Criar conta"
      title="Comece a receber em minutos"
      lede="Sua página fica pronta assim que confirmar o e-mail."
      aside={{ to: "/auth/login", label: "Entrar" }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        onChange={clearApiError}
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

        {apiError && <AlertMessage variant="error" message={apiError} />}

        {step === 1 && (
          <div key="step-1" className="space-y-4 animate-fade-in">
            <FormField
              label="Usuário"
              {...register("username")}
              error={errors.username?.message}
              prefix={hostPrefix || undefined}
              disabled={loading}
              autoFocus
            />

            <div className="mt-6">
              <SubmitButton type="button" onClick={() => handleNext(STEP_FIELDS[1])}>
                Continuar
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

            <FormField
              label="E-mail"
              {...register("email")}
              type="email"
              error={errors.email?.message}
              icon="letter"
              placeholder="email@email.com"
              disabled={loading}
            />

            <div className="space-y-1.5">
              <FormField
                label="CPF"
                {...register("cpf")}
                value={formatCpf(cpfValue)}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 11);
                  setValue("cpf", val, { shouldDirty: true, shouldValidate: true });
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

        <p className="text-center text-sm font-medium text-ink-secondary">
          Já tem uma conta?{" "}
          <Link
            to="/auth/login"
            className="text-info hover:text-info-hover font-semibold underline transition-colors duration-150"
          >
            Entre aqui
          </Link>
        </p>
      </form>
    </AuthSplit>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, redirect, useActionData, useNavigation, useSubmit } from "react-router";
import { z } from "zod";
import { authApi } from "~/api/modules/auth";
import { AuthCard } from "~/components/auth/AuthCard";
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

export default function Register({ actionData }: Route.ComponentProps) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const loading = navigation.state === "submitting";
  const [apiError, clearApiError] = useActionError(actionData);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch("password");
  const cpfValue = watch("cpf") || "";

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
    <AuthCard
      title="Crie sua conta"
      subtitle="Começe a receber doações em minutos."
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        onChange={clearApiError}
        className="space-y-4"
      >
        {apiError && <AlertMessage variant="error" message={apiError} />}

        <FormField
          label="Nome"
          {...register("name")}
          error={errors.name?.message}
          icon="user"
          placeholder="Luca Santos"
          disabled={loading}
        />

        <FormField
          label="Usuário"
          {...register("username")}
          error={errors.username?.message}
          icon="mention-circle"
          placeholder="lucasantos"
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
          maxLength={14}
          disabled={loading}
        />

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

        <div className="mt-6">
          <SubmitButton loading={loading}>Criar conta</SubmitButton>
        </div>

        <p className="mt-4 text-center text-sm font-medium text-ink-secondary">
          Já tem uma conta?{" "}
          <Link
            to="/auth/login"
            className="text-info hover:text-info-hover font-semibold underline transition-colors duration-150"
          >
            Entre aqui
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}

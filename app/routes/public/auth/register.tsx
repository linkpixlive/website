import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import { authApi } from "~/api/modules/auth";
import { AuthCard } from "~/components/auth/AuthCard";
import { PasswordField } from "~/components/auth/PasswordField";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { FormField } from "~/components/ui/FormField";
import { SubmitButton } from "~/components/ui/SubmitButton";
import {
  getPasswordStrength,
  registerSchema,
} from "~/validators/auth-validator";
import type { Route } from "./+types/register";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Create Account — LinkPix" }];
}

type RegisterFormValues = z.infer<typeof registerSchema>;

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

export default function Register() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch("password");
  const cpfValue = watch("cpf") || "";

  const onSubmit = async (data: RegisterFormValues) => {
    setApiError(null);
    const cpf = data.cpf.replace(/\D/g, "");

    const result = await authApi.register({
      name: data.name,
      username: data.username,
      email: data.email,
      password: data.password,
      cpf,
    });

    if (!result.success) {
      setApiError(result.error.message);
      return;
    }

    navigate(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
  };

  return (
    <AuthCard
      title="Crie sua conta"
      subtitle="Começe a receber doações em minutos."
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        onChange={() => setApiError(null)}
        className="space-y-4"
      >
        {apiError && <AlertMessage variant="error" message={apiError} />}

        <FormField
          label="Nome"
          {...register("name")}
          error={errors.name?.message}
          icon="user"
          placeholder="Luca Santos"
          disabled={isSubmitting}
        />

        <FormField
          label="Usuário"
          {...register("username")}
          error={errors.username?.message}
          icon="mention-circle"
          placeholder="lucasantos"
          disabled={isSubmitting}
        />

        <FormField
          label="E-mail"
          {...register("email")}
          type="email"
          error={errors.email?.message}
          icon="letter"
          placeholder="email@email.com"
          disabled={isSubmitting}
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
          disabled={isSubmitting}
        />

        <PasswordField
          label="Senha"
          {...register("password")}
          error={errors.password?.message}
          icon="lock"
          placeholder="Crie uma senha forte"
          disabled={isSubmitting}
          showStrength
          strengthScore={getPasswordStrength(passwordValue || "")}
        />

        <PasswordField
          label="Confirmar Senha"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
          icon="lock"
          placeholder="Confirme sua senha"
          disabled={isSubmitting}
        />

        <div className="mt-6">
          <SubmitButton loading={isSubmitting}>Criar conta</SubmitButton>
        </div>

        <p className="mt-4 text-center text-sm font-medium text-ink-secondary">
          Já tem uma conta?{" "}
          <Link
            to="/auth/login"
            className="text-info hover:text-blue-700 font-semibold underline transition-colors duration-150"
          >
            Entre aqui
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}

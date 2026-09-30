import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { z } from "zod";
import { AuthDivider } from "./AuthDivider";
import { PasswordField } from "./PasswordField";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { FormField } from "~/components/ui/FormField";
import { SubmitButton } from "~/components/ui/SubmitButton";
import { loginSchema } from "~/validators/auth-validator";

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  loading: boolean;
  apiError: string | null;
  onClearError: () => void;
  onSubmit: (data: LoginFormValues) => void;
}

export function LoginForm({ loading, apiError, onClearError, onSubmit }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onChange={onClearError}
      className="space-y-4"
    >
      {apiError && <AlertMessage variant="error" message={apiError} />}

      <FormField
        label="E-mail"
        {...register("email")}
        type="email"
        error={errors.email?.message}
        icon="letter"
        placeholder="email@email.com"
        disabled={loading}
        autoFocus
      />

      <div className="space-y-1">
        <PasswordField
          label="Senha"
          {...register("password")}
          error={errors.password?.message}
          icon="lock"
          placeholder="Digite sua senha"
          disabled={loading}
        />
        <div className="flex justify-end">
          <Link
            to="/auth/forgot-password"
            className="text-[13px] font-semibold text-info hover:text-info-hover transition-colors duration-150"
          >
            Esqueceu a senha?
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <SubmitButton loading={loading}>Entrar</SubmitButton>
      </div>

      <AuthDivider text="ou" />

      <p className="mt-4 text-center text-sm font-medium text-ink-secondary">
        Não tem uma conta?{" "}
        <Link
          to="/auth/register"
          className="text-info hover:text-info-hover font-semibold underline transition-colors duration-150"
        >
          Crie aqui
        </Link>
      </p>
    </form>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, redirect, useNavigation, useSubmit } from "react-router";
import { z } from "zod";
import { authApi } from "~/api/modules/auth";
import { AuthShell } from "~/components/auth/AuthShell";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { FormField } from "~/components/ui/FormField";
import { SubmitButton } from "~/components/ui/SubmitButton";
import { useActionError } from "~/hooks/useActionError";
import { registerInitSchema, registerSchema } from "~/validators/auth-validator";
import type { Route } from "./+types/register";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Criar conta — LinkPix" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const candidate = new URL(request.url).searchParams.get("username") ?? "";
  const parsed = registerSchema.shape.username.safeParse(candidate);
  return { initialUsername: parsed.success ? parsed.data : "" };
}

export async function action({ request }: Route.ActionArgs) {
  const url = new URL(request.url);
  const candidate = url.searchParams.get("username") ?? "";
  const parsedUsername = registerSchema.shape.username.safeParse(candidate);

  const formData = await request.formData();
  const parsed = registerInitSchema.safeParse({
    email: String(formData.get("email") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const result = await authApi.registerInit(parsed.data);
  if (!result.success) {
    return { error: result.error.message };
  }

  const params = new URLSearchParams({ email: parsed.data.email });
  if (parsedUsername.success) params.set("username", parsedUsername.data);

  return redirect(`/auth/verify-email?${params.toString()}`);
}

type RegisterFormValues = z.infer<typeof registerInitSchema>;

export default function Register({ actionData }: Route.ComponentProps) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const loading = navigation.state === "submitting";
  const [apiError, clearApiError] = useActionError(actionData);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerInitSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: RegisterFormValues) => {
    clearApiError();
    const formData = new FormData();
    formData.append("email", data.email);
    submit(formData, { method: "post" });
  };

  return (
    <AuthShell
      eyebrow="Criar conta"
      title="Comece a receber em minutos"
      lede="Informe seu e-mail para receber o código de confirmação."
      aside={{ to: "/auth/login", label: "Entrar" }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        onChange={() => clearApiError()}
        className="space-y-6"
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

        <SubmitButton loading={loading}>Continuar</SubmitButton>

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
    </AuthShell>
  );
}

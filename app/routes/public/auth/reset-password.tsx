import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router";
import { z } from "zod";
import { authApi } from "~/api/modules/auth";
import { AuthCard } from "~/components/auth/AuthCard";
import { PasswordField } from "~/components/auth/PasswordField";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { SubmitButton } from "~/components/ui/SubmitButton";
import {
  getPasswordStrength,
  resetPasswordSchema,
} from "~/validators/auth-validator";
import type { Route } from "./+types/reset-password";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Reset Password — LinkPix" }];
}

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const newPasswordValue = watch("newPassword");

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      setApiError("Invalid or missing reset token.");
      return;
    }

    setApiError(null);
    const result = await authApi.resetPassword({
      token,
      newPassword: data.newPassword,
    });

    if (!result.success) {
      setApiError(result.error.message);
      return;
    }

    setSuccess(true);
  };

  if (!token) {
    return (
      <AuthCard
        title="Invalid Link"
        subtitle="This password reset link is invalid or missing."
      >
        <div className="space-y-6">
          <AlertMessage variant="error" message="Missing reset token." />
          <div className="text-center">
            <Link
              to="/auth/forgot-password"
              className="text-sm text-primary hover:text-primary-hover font-medium transition-colors duration-150"
            >
              Request a new link
            </Link>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Set new password" subtitle="Choose a strong password">
      {success ? (
        <div className="space-y-6">
          <AlertMessage
            variant="success"
            message="Your password has been changed successfully."
          />
          <div className="text-center mt-6">
            <Link
              to="/auth/login"
              className="inline-block px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors"
            >
              Go to sign in
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          onChange={() => setApiError(null)}
          className="space-y-4"
        >
          {apiError && <AlertMessage variant="error" message={apiError} />}

          <PasswordField
            label="New Password"
            {...register("newPassword")}
            error={errors.newPassword?.message}
            icon={Lock}
            placeholder="Create a strong password"
            disabled={isSubmitting}
            showStrength
            strengthScore={getPasswordStrength(newPasswordValue || "")}
            autoFocus
          />

          <PasswordField
            label="Confirm Password"
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
            icon={Lock}
            placeholder="Confirm your password"
            disabled={isSubmitting}
          />

          <div className="mt-6">
            <SubmitButton loading={isSubmitting}>Reset password</SubmitButton>
          </div>
        </form>
      )}
    </AuthCard>
  );
}

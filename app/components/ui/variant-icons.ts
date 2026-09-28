import type { IconName } from "~/components/ui/Icon";

export type FeedbackVariant = "success" | "error" | "info";

export const variantIconNames: Record<
  FeedbackVariant,
  Extract<IconName, "check-circle" | "danger-circle" | "info-circle">
> = {
  success: "check-circle",
  error: "danger-circle",
  info: "info-circle",
};

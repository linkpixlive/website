export function buildIntentFormData(
  intent: string,
  values: Record<string, string> = {},
): FormData {
  const formData = new FormData();
  formData.append("intent", intent);
  for (const [key, value] of Object.entries(values)) {
    formData.append(key, value);
  }
  return formData;
}

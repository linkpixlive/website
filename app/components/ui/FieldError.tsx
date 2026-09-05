export function FieldError({ message, id }: { message?: string | null; id?: string }) {
  if (!message) return null;
  return (
    <span id={id} className="text-error text-xs font-medium animate-[shake_0.4s_ease-in-out]">
      {message}
    </span>
  );
}

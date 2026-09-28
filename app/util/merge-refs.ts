/** Mescla refs (callback + objeto) para um mesmo elemento. */
export function mergeRefs<T>(
  ...refs: (React.Ref<T | null> | undefined)[]
) {
  return (el: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    }
  };
}

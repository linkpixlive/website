import type { Route } from "./+types/index";

export function meta({}: Route.MetaArgs) {
  return [{ title: "LinkPix" }];
}

// Placeholder: a home será construída aqui futuramente (sem redirect).
export default function HomePlaceholder() {
  return <main className="min-h-[40dvh]" />;
}

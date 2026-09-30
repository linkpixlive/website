import type { Route } from "./+types/index";

export function meta({}: Route.MetaArgs) {
  return [{ title: "LinkPix" }];
}

export default function HomePlaceholder() {
  return <main className="min-h-[40dvh]" />;
}

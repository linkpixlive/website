import { NavLink, Outlet, useLocation } from "react-router";
import { useLayoutEffect, useRef, useState } from "react";
import { PageHeader } from "~/components/dashboard/PageHeader";
import type { Route } from "./+types/layout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Integrações — LinkPix" },
    {
      name: "description",
      content: "Configure alertas, widgets e regras de doação da sua transmissão",
    },
  ];
}

const sections = [
  { label: "Overlay", to: "/widgets/overlay" },
  { label: "Regras", to: "/widgets/regras" },
];

export default function WidgetsLayout() {
  const { pathname } = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicator, setIndicator] = useState({
    left: 0,
    width: 0,
    visible: false,
  });

  // Casa exata; ordena pela rota mais longa para evitar colisão
  // futura (ex.: /widgets/regras-extra não deve acender "Configurações").
  const active =
    [...sections]
      .sort((a, b) => b.to.length - a.to.length)
      .find(
        (section) =>
          pathname === section.to || pathname.startsWith(`${section.to}/`),
      ) ?? sections[0];

  // Mede a aba ativa e posiciona o indicador; a transição de
  // left/width faz o fundo "escorregar" entre as opções.
  useLayoutEffect(() => {
    const measure = () => {
      const el = itemRefs.current[active.to];
      if (!el) return;
      setIndicator({
        left: el.offsetLeft,
        width: el.offsetWidth,
        visible: true,
      });
    };
    measure();

    const nav = navRef.current;
    if (!nav || typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [active.to]);

  return (
    <div>
      <PageHeader
        title="Integrações"
        subtitle="Configure alertas, widgets e regras de doação da sua transmissão."
      />

      <nav
        ref={navRef}
        aria-label="Seções de integrações"
        className="relative inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-line bg-card p-1 shadow-xs"
      >
        <span
          aria-hidden="true"
          style={{ left: indicator.left, width: indicator.width }}
          className={`pointer-events-none absolute top-1 bottom-1 rounded-full bg-inverse transition-[left,width,opacity] duration-200 ease-out motion-reduce:transition-none ${
            indicator.visible ? "opacity-100" : "opacity-0"
          }`}
        />
        {sections.map((section) => (
          <NavLink
            key={section.to}
            ref={(el) => {
              itemRefs.current[section.to] = el;
            }}
            to={section.to}
            className={({ isActive }) =>
              `relative z-10 whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-bold transition-colors duration-150 outline-none ${
                isActive
                  ? "text-white"
                  : "text-ink-secondary hover:text-ink-heading"
              }`
            }
          >
            {section.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-5">
        <Outlet />
      </div>
    </div>
  );
}

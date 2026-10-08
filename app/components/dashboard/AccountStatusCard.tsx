import { Link } from "react-router";
import { Icon } from "~/components/ui/Icon";
import { SECTION_HEADING_CLASS } from "~/components/ui/classes";

export interface AccountChecklist {
  pixCount: number;
  rulesReviewed: boolean;
  has2fa: boolean;
  emailVerified: boolean | null;
}

interface AccountStatusCardProps {
  checklist: AccountChecklist | null;
}

interface Row {
  key: string;
  title: string;
  description: string;
  to: string;
  done: boolean;
}

export function AccountStatusCard({ checklist }: AccountStatusCardProps) {
  if (!checklist) {
    return (
      <section aria-label="Status da conta">
        <span className={SECTION_HEADING_CLASS}>
          Status da conta
        </span>
        <p className="mt-3 text-sm font-medium text-ink-secondary">
          Não foi possível carregar o status agora. Tente recarregar a página.
        </p>
      </section>
    );
  }

  const rows: Row[] = [
    {
      key: "pix",
      title: "Chave Pix",
      description:
        checklist.pixCount > 0
          ? `${checklist.pixCount} ${checklist.pixCount === 1 ? "cadastrada" : "cadastradas"}`
          : "Cadastre para poder sacar",
      to: "/carteira",
      done: checklist.pixCount > 0,
    },
    {
      key: "rules",
      title: "Regras de doação",
      description: checklist.rulesReviewed
        ? "Mínimos e moderação revisados"
        : "Revise valores mínimos e moderação",
      to: "/widgets/regras",
      done: checklist.rulesReviewed,
    },
    {
      key: "2fa",
      title: "Login em dois fatores",
      description: checklist.has2fa ? "Proteção extra ativa" : "Recomendado para segurança",
      to: "/conta",
      done: checklist.has2fa,
    },
    ...(checklist.emailVerified === null
      ? []
      : [
          {
            key: "email",
            title: "Email verificado",
            description: checklist.emailVerified
              ? "Conta verificada"
              : "Confirme seu email",
            to: "/conta",
            done: checklist.emailVerified,
          },
        ]),
  ];

  const doneCount = rows.filter((r) => r.done).length;
  const allDone = doneCount === rows.length;

  return (
    <section aria-label="Status da conta">
      <div className="flex items-baseline justify-between gap-3">
        <span className={SECTION_HEADING_CLASS}>
          Status da conta
        </span>
        <span className="text-[11px] font-semibold text-ink-label shrink-0">
          {doneCount} de {rows.length} prontos
        </span>
      </div>

      {allDone ? (
        <div className="flex items-center gap-2.5 rounded-2xl bg-success/10 px-4 py-3 mt-3">
          <Icon name="check-circle" size={18} strokeWidth={2} className="text-success shrink-0" />
          <p className="text-[13px] font-bold text-success leading-snug">
            Tudo pronto para receber. Boa live!
          </p>
        </div>
      ) : (
        <>
          <div
            className="mt-3 h-1 overflow-hidden rounded-full bg-wash"
            role="progressbar"
            aria-valuenow={doneCount}
            aria-valuemin={0}
            aria-valuemax={rows.length}
            aria-label={`${doneCount} de ${rows.length} itens prontos`}
          >
            <div
              className="h-full rounded-full bg-ink-heading transition-all duration-200"
              style={{ width: `${(doneCount / rows.length) * 100}%` }}
            />
          </div>
          <ul className="mt-1 divide-y divide-line/60">
            {rows.map((row) => (
              <li key={row.key}>
                <Link
                  to={row.to}
                  className="flex w-full items-center gap-3 py-2.5 text-left transition-colors duration-150 outline-none group"
                >
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] font-semibold text-ink-body leading-tight">
                      {row.title}
                    </span>
                    <span className="block text-xs font-medium text-ink-muted mt-0.5 truncate">
                      {row.description}
                    </span>
                  </span>
                  {row.done ? (
                    <Icon
                      name="check-circle"
                      size={18}
                      strokeWidth={2}
                      className="text-success shrink-0"
                      aria-label="Pronto"
                    />
                  ) : (
                    <Icon
                      name="alt-arrow-right"
                      size={16}
                      strokeWidth={1.9}
                      className="text-ink-label shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
                      aria-label="Resolver"
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

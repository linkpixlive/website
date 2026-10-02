import { Link } from "react-router";
import { Icon, type IconName } from "~/components/ui/Icon";
import {
  CARD_CLASS,
  ICON_TILE_CLASS,
  SECTION_HEADING_CLASS,
} from "~/components/ui/classes";

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
  icon: IconName;
  title: string;
  description: string;
  to: string;
  done: boolean;
}

export function AccountStatusCard({ checklist }: AccountStatusCardProps) {
  if (!checklist) {
    return (
      <div className={`h-full ${CARD_CLASS}`}>
        <span className={SECTION_HEADING_CLASS}>
          Status da conta
        </span>
        <p className="mt-3 text-sm font-medium text-ink-secondary">
          Não foi possível carregar o status agora. Tente recarregar a página.
        </p>
      </div>
    );
  }

  const rows: Row[] = [
    {
      key: "pix",
      icon: "wallet",
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
      icon: "tuning",
      title: "Regras de doação",
      description: checklist.rulesReviewed
        ? "Mínimos e moderação revisados"
        : "Revise valores mínimos e moderação",
      to: "/widgets/regras",
      done: checklist.rulesReviewed,
    },
    {
      key: "2fa",
      icon: "lock",
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
            icon: "letter" as IconName,
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
    <div className={`h-full ${CARD_CLASS} flex flex-col`}>
      <div className="flex items-center justify-between mb-1">
        <span className={SECTION_HEADING_CLASS}>
          Status da conta
        </span>
        <span className="text-[11px] font-semibold text-ink-label">
          {doneCount} de {rows.length} prontos
        </span>
      </div>

      {allDone ? (
        <div className="flex-1 flex items-center gap-3 rounded-2xl bg-success/10 px-4 py-3 mt-3">
          <Icon name="check-circle" size={20} strokeWidth={2} className="text-success shrink-0" />
          <p className="text-[13px] font-bold text-success leading-snug">
            Tudo pronto para receber. Boa live!
          </p>
        </div>
      ) : (
        <ul className="mt-2 divide-y divide-line">
          {rows.map((row) => (
            <li key={row.key}>
              <Link
                to={row.to}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-wash transition-colors duration-150 outline-none"
              >
                <span className={ICON_TILE_CLASS}>
                  <Icon name={row.icon} size={16} strokeWidth={2} />
                </span>
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
                    className="text-ink-label shrink-0"
                    aria-label="Resolver"
                  />
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { Form, Link, redirect, useNavigation } from "react-router";
import { authApi } from "~/api/modules/auth";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { Icon } from "~/components/ui/Icon";
import { LogoTile } from "~/components/ui/LogoTile";
import { cn } from "~/util/cn";
import { registerSchema } from "~/validators/auth-validator";
import type { ReactNode } from "react";
import type { Route } from "./+types/landing";

export function meta() {
  return [
    { title: "LinkPix — Doações via Pix para creators" },
    {
      name: "description",
      content:
        "Crie sua página de doações via Pix em minutos. Mensagens narradas por IA e taxa de 4% por doação.",
    },
  ];
}

export function loader({ request }: Route.LoaderArgs) {
  return { host: new URL(request.url).host + "/" };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const parsed = registerSchema.shape.username.safeParse(
    String(formData.get("username") ?? ""),
  );

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0].message,
      username: String(formData.get("username") ?? ""),
    };
  }

  const result = await authApi.validateUsername(parsed.data);
  if (!result.success) {
    return { error: result.error.message, username: parsed.data };
  }

  return redirect(`/auth/register?username=${encodeURIComponent(parsed.data)}`);
}

const tileBase = "relative overflow-hidden rounded-[28px]";

const darkPill = "bg-hero text-on-hero";
const whitePill = "bg-card text-ink-heading border border-line";
const accent = "bg-brand-button text-on-brand";

function PhotoTile({
  src,
  alt,
  className,
  children,
}: {
  src: string;
  alt: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn(tileBase, className)}>
      <img src={src} alt={alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
      {children}
    </div>
  );
}

function LandingHeader() {
  return (
    <header>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <LogoTile href="/" variant="dark" />
        <div className="flex items-center gap-6">
          <Link
            to="/auth/login"
            className="text-sm font-semibold text-ink-heading hover:text-ink-secondary"
          >
            Entrar
          </Link>
          <Link
            to="/auth/register"
            className="rounded-full bg-brand-button px-5 py-2.5 text-sm font-semibold text-on-brand hover:bg-brand-hover"
          >
            Criar conta
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero({
  actionData,
  host,
  validatingUsername,
}: {
  actionData: Route.ComponentProps["actionData"];
  host: string;
  validatingUsername: boolean;
}) {
  return (
    <section className="flex flex-col items-center px-6 pb-12 pt-16 text-center md:pt-20">
      {/* Escada mantém o h1 em 2 linhas: linha 2 ≈ 713px @54px (budget 976px no lg+, 720px no md). */}
      <h1 className="mt-6 max-w-5xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink-heading md:text-[44px] lg:text-[54px]">
        Monetize sua live
        <br />
        e engaje sua comunidade
      </h1>
      <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-secondary">
        Sua página pronta em minutos, doações via Pix com mensagens narradas por IA e taxa
        de 4% por doação.
      </p>
      {/* Verifica o username antes de abrir o cadastro, que recebe o valor pré-preenchido. */}
      <Form
        action="?index"
        method="post"
        className="mt-7 flex w-full max-w-[26rem] items-center gap-1 rounded-full border border-line bg-card py-1.5 pl-4 pr-1"
      >
        <span className="shrink-0 text-sm font-medium text-ink-muted">{host}</span>
        <input
          type="text"
          name="username"
          defaultValue={actionData?.username ?? ""}
          placeholder="seu-nome"
          aria-label="Username da sua página"
          autoCapitalize="none"
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-ink-heading outline-none placeholder:font-normal placeholder:text-ink-placeholder"
        />
        <button
          type="submit"
          disabled={validatingUsername}
          className="shrink-0 cursor-pointer rounded-full bg-brand-button px-5 py-2.5 text-sm font-semibold text-on-brand hover:bg-brand-hover"
        >
          {validatingUsername ? "Validando..." : "Criar conta"}
        </button>
      </Form>
      {actionData?.error && (
        <div className="mt-3 w-full max-w-[26rem] text-left">
          <AlertMessage variant="error" message={actionData.error} />
        </div>
      )}
    </section>
  );
}

function Bento() {
  return (
    <section className="mx-auto max-w-6xl space-y-3 px-6 pb-16">
      <div className="grid h-[190px] grid-cols-2 gap-3 md:h-[210px] md:grid-cols-[160fr_390fr_220fr_230fr]">
        <PhotoTile
          src="/image1.webp"
          alt="Creator em setup gamer com iluminação roxa"
        />
        <PhotoTile
          src="/image2.webp"
          alt="Creator apontando para a câmera"
        >
          <span className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full ${whitePill}`}>
            <Icon name="square-arrow-right-up" size={14} strokeWidth={1.9} />
          </span>
          <span className={`absolute bottom-3 right-3 flex items-center gap-2 rounded-full py-1.5 pl-4 pr-2 text-xs font-semibold ${darkPill}`}>
            Doação recebida
            <span className={`flex h-5 w-5 items-center justify-center rounded-full ${accent}`}>
              <Icon name="play" size={10} strokeWidth={2.4} />
            </span>
          </span>
        </PhotoTile>
        <PhotoTile
          src="/image3.webp"
          alt="Creator fazendo sinal de paz"
        >
          <span className="absolute left-3 top-3 rounded-full bg-error-solid px-2.5 py-1 text-[10px] font-bold tracking-widest text-white">
            LIVE
          </span>
          <span className={`absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full ${darkPill}`}>
            <Icon name="play" size={12} strokeWidth={2.4} />
          </span>
        </PhotoTile>
        <PhotoTile
          src="/image4.webp"
          alt="Creator com headset de orelhas de gato"
        />
      </div>

      <div className="grid h-[190px] grid-cols-2 gap-3 md:h-[230px] md:grid-cols-[380fr_220fr_410fr]">
        <div className={`${tileBase} bg-brand-button`}>
          <div className="flex h-full flex-col justify-end p-4 md:p-5">
            <span className="font-display text-xl font-bold leading-[1.1] tracking-tight text-ink-heading md:text-2xl">
              Sua live. Suas regras.
            </span>
            <span className="mt-2 text-xs leading-snug text-ink-secondary md:text-sm">
              Mensagens, alertas e reações que aproximam você da sua
              comunidade.
            </span>
          </div>
        </div>
        <PhotoTile
          src="/image6.webp"
          alt="Creator gravando podcast"
        >
          <div className="absolute inset-x-0 bottom-0 flex h-20 items-end bg-gradient-to-t from-hero/80 to-transparent p-3">
            <span className="font-display text-sm font-semibold leading-tight text-on-hero">
              Boa live!
            </span>
            <span className="mt-0.5 block text-[11px] font-medium text-on-hero/75">
              R$ 20 · @viewer
            </span>
          </div>
        </PhotoTile>
        <PhotoTile
          src="/image7.webp"
          alt="Creator em setup de streaming rosé"
          className="max-md:col-span-2"
        >
          <span className={`absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${whitePill}`}>
            <Icon name="widget-2" size={14} strokeWidth={1.9} />
            Alertas ao vivo
          </span>
          <span className={`absolute bottom-3 left-3 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${whitePill}`}>
            Doação narrada por IA
            <span className={`flex h-5 w-5 items-center justify-center rounded-full ${accent}`}>
              <Icon name="play" size={10} strokeWidth={2.4} />
            </span>
          </span>
          <span className="absolute bottom-3 right-3 flex gap-1.5">
            <span className={`grid h-7 w-7 place-items-center rounded-full ${whitePill}`}>
              <Icon name="chat-dots" size={12} strokeWidth={1.9} />
            </span>
            <span className={`grid h-7 w-7 place-items-center rounded-full ${whitePill}`}>
              <Icon name="close-circle" size={12} strokeWidth={1.9} />
            </span>
            <span className={`grid h-7 w-7 place-items-center rounded-full ${accent}`}>
              <Icon name="add-circle" size={12} strokeWidth={2.4} />
            </span>
          </span>
        </PhotoTile>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer>
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 pb-8 pt-2 text-center sm:flex-row">
        <nav className="flex items-center gap-5 text-sm font-semibold text-ink-secondary">
          <Link to="/privacidade" className="hover:text-ink-heading">
            Privacidade
          </Link>
          <Link to="/termos" className="hover:text-ink-heading">
            Termos
          </Link>
        </nav>
        <p className="text-xs text-ink-muted">
          © {new Date().getFullYear()} LinkPix. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}

export default function Landing({ loaderData, actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const validatingUsername = navigation.state === "submitting";

  return (
    <main>
      <LandingHeader />
      <Hero actionData={actionData} host={loaderData.host} validatingUsername={validatingUsername} />
      <Bento />
      <LandingFooter />
    </main>
  );
}

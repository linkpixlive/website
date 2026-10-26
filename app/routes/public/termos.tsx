import { Link } from "react-router";
import { LogoTile } from "~/components/ui/LogoTile";

export function meta() {
  return [{ title: "Termos de Uso — LinkPix" }];
}

const ULTIMA_ATUALIZACAO = "23/10/2026";

const sectionTitle =
  "mt-10 font-display text-lg font-bold tracking-tight text-ink-heading";

export default function Termos() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-14">
      <LogoTile href="/" variant="auto" />
      <h1 className="mt-8 font-display text-3xl font-bold tracking-tight text-ink-heading">
        Termos de Uso
      </h1>
      <p className="mt-2 text-xs text-ink-muted">
        Última atualização: {ULTIMA_ATUALIZACAO}
      </p>
      <div className="text-sm leading-relaxed text-ink-body">
        <p className="mt-4">
          Estes termos regulam o uso da LinkPix, plataforma de doações via Pix
          para criadores de conteúdo. Ao criar uma conta ou usar a plataforma,
          você concorda com eles e com a nossa{" "}
          <Link
            to="/privacidade"
            className="font-semibold text-info underline hover:text-info-hover"
          >
            Política de Privacidade
          </Link>
          .
        </p>

        <h2 className={sectionTitle}>Aceitação</h2>
        <p>
          O acesso à plataforma, a criação de conta e o uso de qualquer
          funcionalidade implicam aceitação integral destes termos.
        </p>

        <h2 className={sectionTitle}>Sua conta</h2>
        <p>
          Para criar sua conta você fornece nome, e-mail, CPF e nome de
          usuário, e confirma o e-mail de cadastro. Mantenha seus dados
          verdadeiros e atualizados: a LinkPix pode solicitá-los para validar
          saques ou cumprir obrigações legais. Sua senha é de responsabilidade
          exclusiva sua; comunique-nos imediatamente qualquer acesso não
          autorizado.
        </p>

        <h2 className={sectionTitle}>Idade mínima</h2>
        <p>
          Você deve ter 18 anos ou mais para criar conta e receber doações na
          plataforma.
        </p>

        <h2 className={sectionTitle}>Página de doações</h2>
        <p>
          Sua página de doações (<code>linkpix.com.br/seu-nome</code>) é
          pública e definida por você: nome, mensagem e widgets exibidos. O
          tratamento dos dados de creators e doadores é descrito na Política
          de Privacidade.
        </p>

        <h2 className={sectionTitle}>Doações e taxas</h2>
        <p>
          As doações são enviadas via Pix, com taxa da plataforma informada
          antes da confirmação de cada doação. O valor líquido é creditado na
          sua carteira.
        </p>

        <h2 className={sectionTitle}>Carteira e saques</h2>
        <p>
          O saldo da carteira pode ser sacado a qualquer momento para uma
          chave Pix de titularidade própria. A transferência é processada
          pelo sistema bancário e pode estar sujeita aos prazos das
          instituições financeiras.
        </p>

        <h2 className={sectionTitle}>Widgets e overlay OBS</h2>
        <p>
          Os widgets (overlay OBS) são fornecidos como estão. A LinkPix pode
          alterar ou descontinuar funcionalidades, comunicando mudanças
          relevantes por e-mail.
        </p>

        <h2 className={sectionTitle}>Conduta proibida</h2>
        <p>
          Conteúdo ilegal, discurso de ódio ou fraude resultam em
          encerramento da conta e retenção de valores associados.
        </p>

        <h2 className={sectionTitle}>Mudanças nestes termos</h2>
        <p>
          Podemos atualizar estes termos para refletir novas funcionalidades
          ou exigências legais. Mudanças relevantes são comunicadas por
          e-mail ou na própria plataforma, e o uso continuado após a
          comunicação significa aceitação da versão vigente.
        </p>

        <h2 className={sectionTitle}>Legislação e contato</h2>
        <p>
          Estes termos são regidos pelas leis do Brasil, e eventuais
          disputas serão resolvidas no foro do domicílio do usuário. Dúvidas
          sobre estes termos: suporte@linkpix.com.br.
        </p>
      </div>
      <p className="mt-10">
        <Link
          to="/"
          className="text-[13px] font-semibold text-info underline hover:text-info-hover"
        >
          Voltar para a home
        </Link>
      </p>
    </main>
  );
}

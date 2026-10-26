import { Link } from "react-router";
import { LogoTile } from "~/components/ui/LogoTile";

export function meta() {
  return [{ title: "Política de Privacidade — LinkPix" }];
}

const ULTIMA_ATUALIZACAO = "23/10/2026";

const sectionTitle =
  "mt-10 font-display text-lg font-bold tracking-tight text-ink-heading";

export default function Privacidade() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-14">
      <LogoTile href="/" variant="auto" />
      <h1 className="mt-8 font-display text-3xl font-bold tracking-tight text-ink-heading">
        Política de Privacidade
      </h1>
      <p className="mt-2 text-xs text-ink-muted">
        Última atualização: {ULTIMA_ATUALIZACAO}
      </p>
      <div className="text-sm leading-relaxed text-ink-body">
        <p className="mt-4">
          A LinkPix é uma plataforma de doações via Pix para criadores de
          conteúdo. Esta política explica quais dados pessoais coletamos, como
          usamos e quais são os seus direitos, em conformidade com a Lei nº
          13.709/2018 (LGPD). Ela se aplica a creators que recebem doações e a
          doadores que enviam valores pela plataforma.
        </p>

        <h2 className={sectionTitle}>Dados que coletamos</h2>
        <p>
          <strong>De creators:</strong> nome, e-mail, CPF, nome de usuário,
          chaves Pix cadastradas para saque e o histórico de doações e saques da
          carteira.
        </p>
        <p className="mt-4">
          <strong>De doadores:</strong> nome ou apelido, o valor da doação e a
          mensagem enviada. Não coletamos dados bancários do doador: o Pix é
          processado diretamente pelo seu banco.
        </p>

        <h2 className={sectionTitle}>Como usamos seus dados</h2>
        <p>
          Usamos os dados coletados para criar e autenticar sua conta, operar a
          plataforma, processar saques, registrar o histórico de doações,
          fornecer suporte e gerar a narração das mensagens de doação por voz
          com IA.
        </p>

        <h2 className={sectionTitle}>Compartilhamento</h2>
        <p>
          Não vendemos, alugamos ou compartilhamos dados pessoais com
          terceiros, exceto com prestadores de serviço essenciais à operação
          (como hospedagem e o serviço de narração por IA), quando necessário
          para processar um pagamento ou para cumprir obrigação legal.
        </p>

        <h2 className={sectionTitle}>A doação é pública</h2>
        <p>
          O nome ou apelido e a mensagem da doação são exibidos na página
          pública do creator e no overlay de transmissão (OBS). Envie uma
          mensagem apenas com o que deseja ver em público.
        </p>

        <h2 className={sectionTitle}>Cookies</h2>
        <p>
          Usamos apenas o cookie essencial de sessão, que mantém você
          autenticado. Não usamos cookies de rastreamento ou publicidade, e
          dados de navegação não são utilizados para anúncios.
        </p>

        <h2 className={sectionTitle}>Retenção e exclusão</h2>
        <p>
          Mantemos seus dados enquanto sua conta existir e pelo prazo exigido
          por obrigações legais e fiscais, como registros de transações. Você
          pode solicitar correção ou exclusão dos seus dados a qualquer
          momento pelo seu perfil ou escrevendo para suporte@linkpix.com.br.
        </p>

        <h2 className={sectionTitle}>Seus direitos</h2>
        <p>Nos termos do art. 18 da LGPD, você pode solicitar:</p>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>Acesso aos seus dados e confirmação de tratamento</li>
          <li>Correção de dados incompletos, inexatos ou desatualizados</li>
          <li>Exclusão dos dados tratados com base em consentimento</li>
          <li>Portabilidade dos dados a outro fornecedor</li>
          <li>Informação sobre com quem compartilhamos seus dados</li>
          <li>Revogação do consentimento e oposição a tratamentos</li>
        </ul>

        <h2 className={sectionTitle}>Contato</h2>
        <p>
          Dúvidas sobre esta política: suporte@linkpix.com.br.
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

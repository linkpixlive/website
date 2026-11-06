<p align="center">
  <img src="/public/icon.svg" alt="Logo LinkPix" />
</p>

<p align="center">
  Interface web da plataforma LinkPix que inclui página de doação via Pix, dashboard, carteira, overlay em tempo real e gestão completa da conta do criador.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-24+-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/React%20Router-8-CA4245?logo=reactrouter&logoColor=white" alt="React Router" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vitest-4-6E9F18?logo=vitest&logoColor=white" alt="Vitest" />
  <img src="https://img.shields.io/badge/License-UNLICENSED-lightgrey" alt="License" />
</p>

## 📝 Sobre o Projeto

O **LinkPix Web** é a interface da plataforma **LinkPix**, cobrindo os dois lados da doação: a página pública onde o espectador apoia seu streamer favorito com um Pix e o painel completo do criador com dashboard, carteira, widgets e configurações. Renderizada no servidor e conectada em tempo real à API do LinkPix, garante que cada doação apareça na live no instante em que é confirmada.

## 💡 Funcionalidades

- 🔐 **Autenticação Completa:** Registro, login com verificação em duas etapas (2FA/TOTP), recuperação de senha e confirmação de e-mail, com a sessão mantida por cookie HttpOnly.
- 💸 **Página de Doação Pública:** Presets de valor, mensagem personalizada, escolha de voz (TTS) e QR Code Pix com expiração, acompanhando o status do pagamento em tempo real.
- 📊 **Dashboard do Criador:** Gráfico de receita, resumo de valores, doações recentes e checklist de onboarding para deixar a conta pronta para receber.
- 🧮 **Carteira e Saques:** Visualização de saldos, gestão de chaves Pix e fluxo de saque com taxa e valor mínimo aplicados nas validações.
- 📺 **Overlay para OBS:** Widget de alerta em tempo real via WebSockets, com fila de exibição (pular, repetir e pausar), reprodução de áudio TTS e janela popout de gerenciamento.
- 🤖 **Regras de Doação e Moderação:** Configuração de valores mínimos para texto e áudio, com a moderação das mensagens aplicada pela API (IA).
- 🎛️ **Customização de Widgets:** Configuração do overlay com token de conexão regenerável e controles de volume, pausa e mínimos de doação.
- 👤 **Perfil e Conta:** Edição do perfil público com recorte de foto, alteração de e-mail e senha, gerenciamento do 2FA e desativação da conta.
- 🌙 **Experiência Refinada:** Tema claro/escuro, interface 100% em português e feedback consistente de carregamento e erros.

## 💻 Tecnologias usadas

- ⚛️ **React 19** — Biblioteca declarativa e componentizada para construção da interface.
- 🧭 **React Router 8** — Framework full-stack em _framework mode_: rotas centralizadas, SSR, loaders e actions.
- 📘 **TypeScript** — Tipagem estática de ponta a ponta, inclusive com os tipos gerados do contrato OpenAPI da API.
- ⚡ **Vite 8** — Build tool ultrarrápida para o fluxo de desenvolvimento e o build de produção.
- 🎨 **Tailwind CSS 4** — Estilização utilitária baseada em tokens semânticos do design system (dark mode incluído).
- 🔄 **Axios** — Cliente HTTP centralizado para o envelope padrão de resposta da API.
- 🔌 **Socket.IO Client** — Comunicação em tempo real com os namespaces de dashboard e overlay.
- 📝 **React Hook Form + Zod** — Formulários performáticos com validação compartilhada e mensagens de erro em pt-BR.
- 🧱 **Base UI** — Primitivos acessíveis para modais, popovers e componentes interativos.
- 📈 **Recharts** — Gráficos declarativos para a evolução de receita no dashboard.
- 🔲 **qrcode.react** — Renderização do QR Code Pix diretamente na página de doação.
- 🧪 **Vitest + Testing Library + MSW** — Infraestrutura de testes unitários e de componentes com a rede simulada.

## 🏗️ Arquitetura

A aplicação é construída sobre o **React Router** em _framework mode_ com **SSR** ativo: as páginas são finas e as chamadas ao backend acontecem no servidor, dentro de `loader`s e `action`s, antes de chegarem ao navegador. A comunicação é organizada em camadas com responsabilidades bem definidas:

```text
┌──────────────────────────────────────────────────────────────┐
│                      Navegador (React)                       │
│  Componentes · Formulários (RHF + zod) · Hooks client-only   │
│     socket.io-client (namespaces /dashboard e /overlay)      │
└───────────────┬───────────────────────────┬──────────────────┘
                │ HTTP (loader/action)      │ WebSocket (tempo real)
                │                           └───────────────┐
                ▼                                           │
┌─────────────────────────────────────────────┐             │
│         Servidor (React Router SSR)         │             │
│    Routes ──► api/modules/* ──► axios       │             │
└───────────────┬─────────────────────────────┘             │
                │ REST                                      │
                ▼                                           ▼
┌──────────────────────────────────────────────────────────────┐
│                    API LinkPix (Backend)                     │
└──────────────────────────────────────────────────────────────┘
```

#### 🚫 Diretrizes das Camadas

- **Rota (`routes/`)**: Página fina de entrada: define `loader`/`action`, exige autenticação via `requireValidAuth` e compõe os componentes de domínio. _Não deve conter regras de apresentação complexas nem falar com o backend fora de `api/modules/*`._
- **Módulo de API (`api/modules/`)**: Única porta de comunicação entre o servidor e o backend, um arquivo por domínio, com tipos gerados do OpenAPI e conversão de dinheiro (reais ↔ centavos). _Nenhum componente ou rota deve montar requisições HTTP manualmente._
- **Componente (`components/`)**: Blocos visuais da página, divididos entre genéricos (`ui/`) e de domínio (`components/<domínio>/`), estilizados apenas com os tokens semânticos do design system. _Não deve fazer fetch nem conhecer detalhes do contrato da API._
- **Hook (`hooks/`)**: Estado e efeitos client-only reutilizáveis (sockets, polling, feedback de formulários). _Não deve duplicar responsabilidades da camada de servidor nem acessar a API diretamente._

## 🔀 Fluxo de Doação

Da página pública ao alerta na live, este é o caminho de uma doação na interface:

1. **Página do Streamer:** O espectador acessa `/:username` e o `loader` busca os dados públicos do criador via `api/modules/*`.
2. **Preenchimento:** O visitante escolhe o valor, escreve a mensagem (validada por **Zod**) e pode selecionar uma voz de TTS.
3. **Geração do Pix:** O `action` envia a doação para a API e o **QR Code Pix** é renderizado na tela, com contagem regressiva de expiração.
4. **Confirmação:** A página `/doacao/:id` acompanha o status do pagamento com _polling_ periódico até a confirmação pelo gateway.
5. **Alerta na Live:** Confirmado o pagamento, o backend emite o evento via **Socket.IO** e o overlay do OBS reproduz o alerta visual e o áudio sintetizado, respeitando a fila do streamer.

```text
/:username (página do streamer)
      │  loader busca os dados públicos do criador
      ▼
Formulário de doação (RHF + zod, voz TTS opcional)
      │  action envia a doação para a API
      ▼
POST /donations/donation ──► QR Code Pix com expiração
      │  status do pagamento
      ▼
/doacao/:id — polling do status até a confirmação
      │  pagamento confirmado
      ▼
Socket.IO (/overlay) ──► alerta visual + áudio TTS na live
```

## 📂 Estrutura do Projeto

```text
├── public/                     # Estáticos servidos na raiz (ícones e imagens da landing)
│
├── app/                        # Código-fonte da aplicação (convenção do React Router)
│   ├── api/                    # Camada de comunicação com a API LinkPix
│   │   ├── generated/          # Tipos OpenAPI gerados do backend (pnpm update:apischema)
│   │   ├── http/               # Cliente axios singleton e tipos do envelope de resposta
│   │   └── modules/            # Um arquivo por domínio do backend (única porta server ↔ API)
│   │
│   ├── components/             # Componentes React da interface
│   │   ├── ui/                 # Compartilhados genéricos (Button, Modal, MoneyField, Toast...)
│   │   ├── auth/               # Formulários e desafios de autenticação (login, 2FA)
│   │   ├── dashboard/          # Painel do criador (gráficos, resumo, onboarding)
│   │   ├── donate/             # Fluxo público de doação (formulário, QR Pix, voz TTS)
│   │   ├── wallet/             # Carteira (saldo, chaves Pix, saques)
│   │   ├── widgets/            # Configuração do overlay e regras de doação
│   │   └── .../                # Demais domínios (overlay, fila, doações, perfil, conta)
│   │
│   ├── contexts/               # Providers globais (tema claro/escuro, toasts)
│   ├── hooks/                  # Estado client-only reutilizável (sockets, polling, forms)
│   ├── routes/
│   │   ├── public/             # Landing, página de doação, autenticação e páginas legais
│   │   └── private/            # Painel autenticado (dashboard, carteira, widgets, perfil)
│   ├── types/                  # Tipos client-only
│   ├── util/                   # Sessão/cookie no servidor e utilitários gerais
│   ├── validators/             # Schemas Zod com mensagens de erro em pt-BR
│   ├── fonts/                  # Fontes do design system (Satoshi e GT Maru)
│   ├── routes.ts               # Definição central de rotas (não usa filesystem routing)
│   ├── app.css                 # Tokens do design system (@theme do Tailwind) e fontes
│   └── root.tsx                # Raiz da aplicação (providers globais e ErrorBoundary)
│
├── docs/                       # Documentação interna (arquitetura, padrões, UI e backend)
├── Dockerfile                  # Build multi-stage (Node 24) para produção
├── react-router.config.ts      # Configuração do framework (SSR ativo)
├── vite.config.ts              # Plugins do Vite (Tailwind, React Router e path aliases)
├── AGENTS.md                   # Instruções de contexto e diretrizes para IAs
└── package.json                # Metadados, comandos e pacotes usados no projeto
```

## 🔌 Integração com a API (Backend)

O frontend não possui banco de dados próprio: toda a persistência acontece na **API LinkPix**. A comunicação HTTP é centralizada em `api/modules/*` e as respostas seguem o envelope `{ success, data | error }`, com falhas convertidas em erros tratados pelos `loader`s. A sessão viaja no cookie `auth_token` (HttpOnly, `SameSite=Strict`) e o header `Authorization` é anexado requisição a requisição. Valores monetários trafegam em **reais** e são convertidos para **centavos** apenas nos mappers da camada de API. Em tempo real, o `socket.io-client` consome os namespaces `/dashboard` (painel) e `/overlay` (alertas do OBS).

Os tipos das respostas são gerados a partir do contrato **OpenAPI** do backend, e a documentação interativa dos endpoints fica no Swagger da API:

- **Acesso Local:** `http://localhost:3000/api/docs` _(disponível com o backend em execução)_

#### 🚀 Principais Grupos de Endpoints Consumidos

Para facilitar a navegação no Swagger, as rotas consumidas estão organizadas por contextos de domínio:

- 🔑 `/auth` — Login (com desafio 2FA), registro, recuperação de senha e validação da sessão.
- 💸 `/donations` — Doação pública, consulta de status e histórico de doações.
- 📊 `/dashboard` — Estatísticas de receita e resumos do painel do criador.
- 🏧 `/wallets`, `/pix-keys` & `/withdrawals` — Saldos, chaves Pix e solicitação de saques.
- 🎛️ `/widgets` & `/overlay` — Configuração do widget, token de conexão e controle da fila de alertas.
- 👤 `/profile` & `/account` — Perfil público, e-mail, senha, 2FA e configurações de doação.

## ⚙️ Configuração e Instalação

#### 📋 Pré-requisitos

Antes de iniciar, certifique-se de ter instalado e configurado em sua máquina:
* **Ambiente:** [Node.js 24+](https://nodejs.org/) e [pnpm](https://pnpm.io/)
* **API LinkPix:** O [backend](https://github.com/linkpixlive/api) precisa estar rodando (por padrão em `http://localhost:3000`), é ele quem fornece autenticação, doações e os eventos em tempo real.
* **Credenciais Externas:** Nenhuma. As variáveis do frontend (`VITE_*`) estão documentadas no `.env.example`.

#### 🚀 Comandos para Execução

```bash
# 1. Clone o repositório e acesse a pasta
git clone https://github.com/linkpixlive/website.git
cd website

# 2. Instale as dependências
pnpm install

# 3. Configure as variáveis de ambiente (edite o arquivo .env gerado)
cp .env.example .env

# 4. (Opcional) Gere os tipos da API a partir do Swagger do backend em execução
pnpm update:apischema

# 5. Inicie o servidor em modo de desenvolvimento
pnpm dev
```

## 🪪 Licença

UNLICENSED — Projeto privado.

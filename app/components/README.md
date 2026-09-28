# components/

- `donate/` = fluxo **público** de doação (página do streamer, QR Pix, voz).
  `VoiceSelectField` mora aqui porque nasceu no formulário público; é
  reutilizado em `/widgets/overlay` sem cópia.
- `history/` = **histórico do streamer** (cards, lista, filtros via URL).
- `queue/` = **fila de exibição** (toolbar, popover, painel live/popout,
  seção de controles). Toda a lógica de fila mora aqui, não em `history/`.
- `dashboard/` = chrome do app privado (sidebar, headers) + cards da home.
- `overlay/` = cartão de alerta exibido no OBS (só leitura, tema claro fixo).
  Config do overlay vive em `widgets/` e a API em `api/modules/overlay.ts`
  (público × privado × API são domínios distintos — não fundir).
- `ui/` = primitivas (`Button`, `Modal`, `Switch`, `EmptyState`,
  `ConfirmButtons`, `SegmentedControl`, `FilterShell`, `Spinner`, estilos em
  `header-styles.ts`/`classes.ts`).
- `account/` = Conta (`AccountPanel` + modais); `wallet/` = carteira/saque;
  `profile/` = perfil; `novidades/` = changelog.
- Contratos de API: tipagens de request/response vêm de
  `~/api/generated/api-schema` (`components["schemas"]`, padrão do
  `api/modules/auth.ts`); modelos de UI (centavos, timestamps) vivem em
  `~/types/` com mappers puros na borda (`api/modules/public-donations.ts`).

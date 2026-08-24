# 04: Ativação 2FA (wizard QR → código)

**What to build:** Com 2FA inativa, o streamer abre a linha de autenticação em dois fatores e o modal já dispara o setup automaticamente: mostra carregamento e depois o QR gerado client-side a partir da URL otpauth retornada pelo backend, com o secret em texto ao lado para cadastro manual. O streamer digita o código de 6 dígitos do app autenticador para confirmar; código errado vira erro inline; setup expirado (10 minutos no Redis) apresenta mensagem com caminho para regerar. Ao ativar, o selo da página vira "Ativa" sem recarregar.

**Blocked by:** 01 (Fundação de testes), 02 (Estado real da conta).

**Status:** ready-for-agent

- [ ] Dependência de geração de QR instalada (leve, usada somente aqui)
- [ ] Setup dispara sozinho ao abrir o modal, com estado de carregando
- [ ] QR renderizado a partir da URL otpauth; secret visível para entrada manual
- [ ] Entrada do código via componente OTP existente; validação de 6 dígitos
- [ ] Erro de código inválido inline; erro de setup expirado com ação de regerar
- [ ] Sucesso: toast, modal fecha, selo revalida sem reload
- [ ] Testes MSW: setup no abrir, caminho feliz, código inválido, expiração + regeração

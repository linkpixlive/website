# 07: Desativar conta

**What to build:** A zona de risco deixa de prometer exclusão permanente e passa a dizer a verdade: a conta é desativada e o login a reativa automaticamente. O botão abre um modal destrutivo (cópia em uma frase, pills empilhados vermelho/cancelar, campo de senha). Senha errada mostra erro inline; sucesso mata todas as sessões, limpa o cookie e devolve o streamer à tela de login.

**Blocked by:** 01 (Fundação de testes), 02 (Estado real da conta).

**Status:** ready-for-agent

- [ ] Cópia da seção renomeada para "Desativar conta" mencionando a reativação pelo login
- [ ] Modal destrutivo conforme design system: frase única, pill vermelho em cima, cancelar abaixo
- [ ] Campo de senha obrigatório; erro 401 inline
- [ ] Sucesso dispara redirect para login com cookie limpo
- [ ] Testes MSW: caminho feliz verificando redirect + limpeza do cookie, senha errada inline

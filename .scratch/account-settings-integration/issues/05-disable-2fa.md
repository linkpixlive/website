# 05: Desativação 2FA

**What to build:** Com 2FA ativa, a mesma linha abre o modal em modo desabilitar: o streamer confirma digitando a senha. Senha errada mostra erro inline; sucesso desativa no backend, fecha o modal e o selo da página vira "Inativa" imediatamente.

**Blocked by:** 04 (Ativação 2FA) — mesmo componente de modo duplo.

**Status:** ready-for-agent

- [ ] Modal assume modo "desabilitar" quando `has2fa` é verdadeiro
- [ ] Campo de senha com submissão via intent própria na action da rota
- [ ] Erro de credencial inválida inline
- [ ] Sucesso: toast, modal fecha, selo revalida sem reload
- [ ] Testes MSW: caminho feliz, senha errada, selo alternando de estado

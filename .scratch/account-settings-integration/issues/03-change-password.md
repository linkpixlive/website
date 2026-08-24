# 03: Fluxo alterar senha

**What to build:** O streamer clica em "Alterar senha", um modal pede senha atual, nova senha e confirmação de nova senha. A validação client-side espelha as regras do backend (mínimo 8, máximo 36 caracteres, maiúscula + minúscula + dígito ou especial) e a confirmação precisa bater. Senha atual errada mostra erro inline dentro do modal sem perder o que foi digitado; sucesso fecha o modal com confirmação discreta e o streamer permanece logado (a sessão atual sobrevive; as demais morrem no backend).

**Blocked by:** 01 (Fundação de testes), 02 (Estado real da conta).

**Status:** ready-for-agent

- [ ] Modal seguindo o design system (superfície arredondada, campos pill, botão primário amarelo escasso)
- [ ] Schemas de validação zod num arquivo do domínio conta, incluindo refinamento de igualdade da confirmação
- [ ] Submissão via intent na action da rota usando fetcher próprio do modal
- [ ] Erro de credencial inválida renderizado inline via componente de alerta
- [ ] Sucesso: toast discreto, modal fechado
- [ ] Testes MSW: caminho feliz, senha atual errada (401 → mensagem inline), reprovação de força e de confirmação no client

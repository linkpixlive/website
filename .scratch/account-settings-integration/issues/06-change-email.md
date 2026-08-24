# 06: Fluxo alterar e-mail

**What to build:** O streamer clica na nova linha "E-mail" (que mostra o endereço atual mascarado), informa o novo e-mail e confirma com a senha. E-mail já em uso e senha errada aparecem como erros inline distintos. No sucesso, todas as sessões morrem no backend, um OTP é enviado automaticamente para o novo endereço e o frontend redireciona direto para a tela de verificação de e-mail já contextualizada com o novo endereço — o mesmo destino que cadastro e login usam — limpando o cookie local.

**Blocked by:** 01 (Fundação de testes), 02 (Estado real da conta).

**Status:** ready-for-agent

- [ ] Modal exibindo e-mail atual mascarado + campos novo e-mail e senha
- [ ] Validação zod do formato/tamanho do e-mail
- [ ] Erro 409 (e-mail em uso) e 401 (senha) renderizados inline
- [ ] Sucesso dispara redirect de documento para a verificação com o novo e-mail na query
- [ ] Cookie de autenticação limpo no redirect (token morto não permanece)
- [ ] Testes MSW: caminho feliz verificando URL de redirect, conflito inline, senha errada inline

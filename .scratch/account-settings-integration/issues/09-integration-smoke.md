# 09: Smoke de integração & polimento

**What to build:** Fechamento da integração: a suíte completa passa, o typecheck segue como portão de entrada e um checklist manual contra o backend real valida o que mocks não provam — scan do QR com um app autenticador de verdade, entrega real do OTP por e-mail após troca de endereço, reativação da conta logando novamente, e mensagens legíveis sob rate limit. Ajustes finos de cópia/feedback que só aparecem com backend vivo entram aqui.

**Blocked by:** 03 (Alterar senha), 04 (Ativação 2FA), 05 (Desativação 2FA), 06 (Alterar e-mail), 07 (Desativar conta), 08 (Preferências locais).

**Status:** ready-for-agent

- [ ] Suíte de testes inteira verde
- [ ] Typecheck passando
- [ ] Manual: ativação de 2FA com autenticador real + login exigindo código
- [ ] Manual: troca de e-mail entrega OTP no novo endereço e verificação conclui
- [ ] Manual: desativação → login reativa a conta
- [ ] Manual: erros de rate limit exibidos como mensagens legíveis
- [ ] Se o GitHub CLI estiver disponível: spec portada ao tracker com rótulo `ready-for-agent` (nota da spec)

# 🔐 Correções de Segurança & LGPD — Guia de Aplicação

Este guia explica os passos que **precisam ser feitos no Supabase** (fora do
código do site) para completar as correções de segurança.

---

## 1. ⚠️ URGENTE: Rotacionar a chave service_role vazada

A chave `service_role` estava exposta no JavaScript do site. **Considere-a
comprometida.** Mesmo removida do código, quem já a copiou ainda a tem.

**Como rotacionar:**
1. Acesse o painel do Supabase → **Settings → API**
2. Em **Project API keys**, clique em **Roll** (gerar nova) na `service_role`
3. A chave antiga deixa de funcionar imediatamente
4. Use a chave NOVA apenas como *secret* da Edge Function (passo 2 abaixo) —
   **nunca** cole ela em arquivos `.js` do frontend de novo

---

## 2. Edge Function para criar/excluir usuários

A criação/exclusão de usuários agora passa por uma função no servidor
(`edge-functions/admin-usuarios/index.ts`), que guarda a chave secreta e só
executa se o solicitante for master/admin.

**O que é uma Edge Function?** É um pequeno código que roda nos servidores do
Supabase (não no navegador). Como roda no servidor, ela pode guardar segredos
com segurança — o usuário final nunca vê a chave.

**Como publicar (uma vez):**

1. Instale a CLI do Supabase (no seu computador):
   ```
   npm install -g supabase
   supabase login
   ```
2. Linke seu projeto (o ref está na URL do painel):
   ```
   supabase link --project-ref fnsplftfxvmyiqbigobh
   ```
3. Copie a pasta `edge-functions/admin-usuarios` para `supabase/functions/admin-usuarios`
   (a CLI procura em `supabase/functions/`).
4. Configure os secrets (use a chave service_role NOVA do passo 1):
   ```
   supabase secrets set PROJECT_URL=https://fnsplftfxvmyiqbigobh.supabase.co
   supabase secrets set SERVICE_ROLE_KEY=cole_a_chave_nova_aqui
   supabase secrets set ANON_KEY=cole_a_anon_key_aqui
   ```
5. Faça o deploy:
   ```
   supabase functions deploy admin-usuarios
   ```
6. Pronto. O site já está configurado para chamar
   `.../functions/v1/admin-usuarios`. Se a URL do seu projeto for diferente,
   defina antes de carregar os scripts:
   ```html
   <script>window.EDGE_ADMIN_URL = "https://SEU-REF.supabase.co/functions/v1/admin-usuarios";</script>
   ```

> Enquanto a Edge Function não estiver publicada, criar/excluir usuários pela
> tela de administração vai falhar com uma mensagem de erro — isso é esperado
> e **seguro** (melhor falhar do que expor a chave). O resto do sistema
> funciona normalmente.

---

## 3. RLS Segmentada (`supabase/rls_segmentada.sql`)

Substitui as regras permissivas (`using(true)`) por permissões por perfil.
Rode o arquivo inteiro no **SQL Editor** do Supabase.

Depois de rodar:
- Todos os autenticados continuam **lendo** os resultados.
- Só **master/admin** podem **gravar/apagar**.
- Logs de auditoria viram **imutáveis** (ninguém edita/apaga via API).
- Cada usuário só enxerga o **próprio** cadastro (admin vê todos).

> ⚠️ Teste com um usuário comum depois de aplicar, para garantir que a
> segmentação não bloqueou nada que ele legitimamente precise.

---

## 4. Retenção de dados (`supabase/retencao_dados.sql`)

Cria a função que apaga logs de auditoria antigos (Art. 16 da LGPD).
- O prazo de **12 meses** é um exemplo — **confirme com o jurídico/DPO**.
- Para automatizar, habilite a extensão `pg_cron` e descomente o agendamento.

---

## 5. Itens que dependem de processo (não-código)

- **Aviso de Privacidade**: publicar um texto informando aos colaboradores
  quais dados são tratados e por quê (LGPD Art. 9º). Pode ser uma página
  estática linkada no rodapé/login.
- **Canal de direitos do titular** (Art. 18): definir um e-mail/processo para
  o colaborador solicitar acesso, correção, exportação ou anonimização.
- **Definir prazos de retenção** com o jurídico.

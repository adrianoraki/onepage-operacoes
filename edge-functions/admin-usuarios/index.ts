// ============================================================
// 🔐 EDGE FUNCTION — admin-usuarios
// ------------------------------------------------------------
// Roda no SERVIDOR (Supabase Edge Functions / Deno). A chave
// service_role fica como SECRET do projeto, nunca no navegador.
//
// Fluxo de segurança:
//  1) Recebe o JWT do usuário logado (header Authorization: Bearer ...)
//  2) Valida o token e descobre QUEM está pedindo
//  3) Confirma que o solicitante é master/admin — tanto pelo cadastro
//     em onepage.usuarios (conta nativa do OnePage) quanto pelo nível
//     master gravado em public.perfis (master do StockFlow, que
//     gerencia o OnePage a partir de lá e pode nem ter cadastro
//     próprio em onepage.usuarios) — só então executa a ação
//
// Ações: criar | excluir | redefinir_senha
//
// Deploy:
//   supabase functions deploy admin-usuarios
//
// PROJECT_URL/SERVICE_ROLE_KEY/ANON_KEY vêm dos nomes que o Supabase já
// injeta sozinho em toda Edge Function (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
// SUPABASE_ANON_KEY) — não precisa configurar segredo nenhum manualmente.
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PROJECT_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!; // secret no servidor
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

// Defina ALLOWED_ORIGIN (ex.: https://seuapp.vercel.app) nas variáveis da
// function. Sem ela, cai no domínio de produção do StockFlow (mesmo padrão
// das outras Edge Functions do projeto).
const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") || "https://relatorios-inteligentes.vercel.app";
const cors = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  try {
    // 1) Token do solicitante
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) return json({ error: "Sem token de autenticação" }, 401);

    // Cliente com o token do usuário (para identificar quem é)
    const userClient = createClient(PROJECT_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "Token inválido" }, 401);
    const solicitanteAuthId = userData.user.id;

    // 2) Cliente admin (service_role) — só no servidor
    const admin = createClient(PROJECT_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 3) Confirma que o solicitante é master/admin — conta nativa do
    // OnePage (onepage.usuarios.perfil) OU master do StockFlow
    // (public.perfis.nivel), que passou a gerenciar o OnePage a partir
    // de lá e pode não ter cadastro próprio em onepage.usuarios.
    const [{ data: perfilOnepage }, { data: perfilStockflow }] = await Promise.all([
      admin.schema("onepage").from("usuarios").select("perfil").eq("auth_user_id", solicitanteAuthId).maybeSingle(),
      admin.schema("public").from("perfis").select("nivel, ativo").eq("id", solicitanteAuthId).maybeSingle(),
    ]);

    const autorizadoOnepage = !!perfilOnepage && ["master", "admin"].includes(perfilOnepage.perfil);
    const autorizadoStockflow = !!perfilStockflow && perfilStockflow.nivel === "master" && perfilStockflow.ativo !== false;
    if (!autorizadoOnepage && !autorizadoStockflow) {
      return json({ error: "Permissão negada (apenas master/admin do OnePage ou master do StockFlow)" }, 403);
    }

    // 4) Executa a ação solicitada
    const body = await req.json().catch(() => ({}));
    const acao = body.acao;

    if (acao === "criar") {
      const email: string = (body.email || "").trim().toLowerCase();
      const senha: string = body.senha || "";
      if (!email || !senha) return json({ error: "email e senha obrigatórios" }, 400);
      if (senha.length < 8) return json({ error: "A senha deve ter ao menos 8 caracteres." }, 400);

      const { data, error } = await admin.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true,
      });
      // E-mail já existente: recupera o usuário em vez de travar — cobre
      // o caso de uma tentativa anterior que criou o Auth mas falhou antes
      // de gravar o registro em onepage.usuarios.
      if (error) {
        if (!error.message.toLowerCase().includes("already")) {
          return json({ error: error.message }, 400);
        }
        const { data: lista } = await admin.auth.admin.listUsers();
        const existente = lista?.users?.find((u) => (u.email || "").toLowerCase() === email);
        if (!existente) return json({ error: "E-mail já existe, mas não foi possível localizá-lo." }, 409);
        await admin.auth.admin.updateUserById(existente.id, { password: senha });
        return json({ user: existente });
      }
      return json({ user: data.user });
    }

    if (acao === "excluir") {
      const { authUserId } = body;
      if (!authUserId) return json({ error: "authUserId obrigatório" }, 400);
      const { error } = await admin.auth.admin.deleteUser(authUserId);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    if (acao === "redefinir_senha") {
      const authUserId: string = body.authUserId || "";
      const novaSenha: string = body.novaSenha || "";
      if (!authUserId || !novaSenha) return json({ error: "authUserId e novaSenha obrigatórios" }, 400);
      if (novaSenha.length < 8) return json({ error: "A senha deve ter ao menos 8 caracteres." }, 400);

      const { error } = await admin.auth.admin.updateUserById(authUserId, { password: novaSenha });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    return json({ error: "Ação desconhecida" }, 400);
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500);
  }
});

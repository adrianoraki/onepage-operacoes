// ============================================================
// 🔐 EDGE FUNCTION — admin-usuarios
// ------------------------------------------------------------
// Roda no SERVIDOR (Supabase Edge Functions / Deno). A chave
// service_role fica como SECRET do projeto, nunca no navegador.
//
// Fluxo de segurança:
//  1) Recebe o JWT do usuário logado (header Authorization: Bearer ...)
//  2) Valida o token e descobre QUEM está pedindo
//  3) Consulta a tabela `usuarios` e confirma se o solicitante é
//     master/admin — só então executa criar/excluir no Auth
//
// Deploy:
//   supabase functions deploy admin-usuarios
//   supabase secrets set SERVICE_ROLE_KEY=... PROJECT_URL=...
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PROJECT_URL = Deno.env.get("PROJECT_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!; // secret no servidor
const ANON_KEY = Deno.env.get("ANON_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*", // troque pelo seu domínio em produção
  "Access-Control-Allow-Headers": "authorization, content-type",
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

    // 3) Confirma que o solicitante é master/admin
    const { data: perfil, error: perfilErr } = await admin
      .from("usuarios")
      .select("perfil")
      .eq("auth_user_id", solicitanteAuthId)
      .single();
    if (perfilErr || !perfil) return json({ error: "Solicitante sem cadastro" }, 403);
    if (!["master", "admin"].includes(perfil.perfil)) {
      return json({ error: "Permissão negada (apenas master/admin)" }, 403);
    }

    // 4) Executa a ação solicitada
    const body = await req.json();
    const acao = body.acao;

    if (acao === "criar") {
      const { email, senha } = body;
      if (!email || !senha) return json({ error: "email e senha obrigatórios" }, 400);
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true,
      });
      if (error) return json({ error: error.message }, 400);
      return json({ user: data.user });
    }

    if (acao === "excluir") {
      const { authUserId } = body;
      if (!authUserId) return json({ error: "authUserId obrigatório" }, 400);
      const { error } = await admin.auth.admin.deleteUser(authUserId);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    return json({ error: "Ação desconhecida" }, 400);
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500);
  }
});

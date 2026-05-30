import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// ==========================
// 🌐 CORS
// ==========================
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ==========================
// 🧱 HELPERS
// ==========================
function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function normalize(value: unknown) {
  return String(value || "").trim();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateTempPassword(length = 10) {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "@#!$%&*";
  const all = upper + lower + numbers + symbols;

  let password = "";
  password += upper[Math.floor(Math.random() * upper.length)];
  password += lower[Math.floor(Math.random() * lower.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  for (let i = 4; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

// ==========================
// 🚀 EDGE FUNCTION
// ==========================
serve(async (req) => {
  if (req.method === "OPTIONS") {
    console.log("🌐 OPTIONS recebido");
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    console.warn("⚠️ Método não permitido:", req.method);
    return jsonResponse({ error: "Método não permitido" }, 405);
  }

  try {
    console.log("🚀 create-user iniciada");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log("🔎 SUPABASE_URL disponível:", !!supabaseUrl);
    console.log("🔎 SUPABASE_SERVICE_ROLE_KEY disponível:", !!serviceRoleKey);

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("❌ SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausentes");
      return jsonResponse(
        { error: "Variáveis de ambiente não configuradas" },
        500,
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const authHeader =
      req.headers.get("Authorization") || req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("⚠️ Authorization header ausente ou inválido");
      return jsonResponse({ error: "Não autenticado" }, 401);
    }

    const token = authHeader.replace("Bearer ", "").trim();

    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !authUser) {
      console.error("❌ Token inválido:", authError);
      return jsonResponse({ error: "Token inválido" }, 401);
    }

    console.log("✅ Usuário chamador autenticado:", authUser.id);

    const { data: callerProfile, error: callerError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("auth_user_id", authUser.id)
      .single();

    if (callerError || !callerProfile) {
      console.error("❌ Perfil do chamador não encontrado:", callerError);
      return jsonResponse(
        { error: "Perfil do usuário chamador não encontrado" },
        403,
      );
    }

    const callerPerfil = normalize(callerProfile.perfil).toLowerCase();

    if (!["admin", "master"].includes(callerPerfil)) {
      console.warn("🚫 Sem permissão para criar usuário:", callerPerfil);
      return jsonResponse(
        { error: "Apenas admin ou master podem criar usuários" },
        403,
      );
    }

    console.log("✅ Permissão do chamador validada:", callerPerfil);

    const body = await req.json();

    const nome = normalize(body.nome);
    const matricula = normalize(body.matricula);
    const email = normalize(body.email).toLowerCase();
    const funcao = normalize(body.funcao);

    const lojaCodigoRaw = normalize(body.loja_codigo);
    const regionalRaw = normalize(body.regional_vinculada);
    const subregionalRaw = normalize(body.subregional_vinculada);

    console.log("📥 Payload recebido:", {
      nome,
      matricula,
      email,
      funcao,
      lojaCodigoRaw,
      regionalRaw,
      subregionalRaw,
    });

    if (!nome || !matricula || !email || !funcao) {
      console.warn("⚠️ Campos obrigatórios ausentes");
      return jsonResponse(
        {
          error: "Nome, matrícula, e-mail e função são obrigatórios.",
        },
        400,
      );
    }

    if (!isValidEmail(email)) {
      console.warn("⚠️ E-mail inválido:", email);
      return jsonResponse({ error: "E-mail inválido" }, 400);
    }

    if (!lojaCodigoRaw && !regionalRaw) {
      console.warn("⚠️ Loja e regional ausentes");
      return jsonResponse(
        { error: "Informe o número da loja ou a regional vinculada." },
        400,
      );
    }

    const { data: existenteEmail } = await supabase
      .from("usuarios")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existenteEmail) {
      console.warn("⚠️ E-mail já cadastrado:", email);
      return jsonResponse(
        { error: "Já existe usuário com este e-mail." },
        409,
      );
    }

    const { data: existenteMatricula } = await supabase
      .from("usuarios")
      .select("id")
      .eq("matricula", matricula)
      .maybeSingle();

    if (existenteMatricula) {
      console.warn("⚠️ Matrícula já cadastrada:", matricula);
      return jsonResponse(
        { error: "Já existe usuário com esta matrícula." },
        409,
      );
    }

    let tipo_visao = "regional";
    let loja_codigo = null;
    let loja_vinculada = null;
    let regional_vinculada = regionalRaw || null;
    let subregional_vinculada = subregionalRaw || null;

    if (lojaCodigoRaw) {
      console.log("🏬 Resolvendo loja automaticamente:", lojaCodigoRaw);

      const { data: loja, error: lojaError } = await supabase
        .from("lojas")
        .select("*")
        .eq("codigo", lojaCodigoRaw)
        .single();

      if (lojaError || !loja) {
        console.error("❌ Loja não encontrada:", lojaError);
        return jsonResponse(
          { error: "Número da loja não encontrado na base." },
          400,
        );
      }

      tipo_visao = "gerencial";
      loja_codigo = String(loja.codigo);
      loja_vinculada = `${loja.codigo} - ${loja.nome}`;
      regional_vinculada = normalize(loja.regional) || regionalRaw || null;

      console.log("✅ Escopo gerencial resolvido:", {
        tipo_visao,
        loja_codigo,
        loja_vinculada,
        regional_vinculada,
        subregional_vinculada,
      });
    } else {
      tipo_visao = "regional";

      console.log("✅ Escopo regional resolvido:", {
        tipo_visao,
        loja_codigo,
        loja_vinculada,
        regional_vinculada,
        subregional_vinculada,
      });
    }

    const senhaTemporaria = generateTempPassword(10);
    const perfilNovo = "usuario";

    console.log("🔐 Senha temporária gerada");

    const { data: authCriado, error: authCreateError } =
      await supabase.auth.admin.createUser({
        email,
        password: senhaTemporaria,
        email_confirm: true,
        user_metadata: {
          nome,
          matricula,
          funcao,
        },
      });

    if (authCreateError || !authCriado?.user) {
      console.error("❌ Erro ao criar usuário no Auth:", authCreateError);
      return jsonResponse(
        {
          error:
            authCreateError?.message || "Erro ao criar usuário no Auth",
        },
        500,
      );
    }

    const authUserId = authCriado.user.id;

    console.log("✅ Usuário criado no Auth:", authUserId);

    const payloadUsuario = {
      auth_user_id: authUserId,
      nome,
      sobrenome: "",
      matricula,
      email,
      funcao,
      perfil: perfilNovo,

      tipo_visao,
      loja_codigo,
      loja_vinculada,
      regional_vinculada,
      subregional_vinculada,

      primeiro_acesso: true,
      permissoes: {},
    };

    console.log("🗃️ Salvando perfil em usuarios:", payloadUsuario);

    const { data: usuarioCriado, error: usuarioError } = await supabase
      .from("usuarios")
      .insert([payloadUsuario])
      .select()
      .single();

    if (usuarioError || !usuarioCriado) {
      console.error("❌ Erro ao criar perfil em usuarios:", usuarioError);

      try {
        await supabase.auth.admin.deleteUser(authUserId);
        console.warn("♻️ Rollback do Auth executado");
      } catch (rollbackError) {
        console.error("❌ Erro no rollback do Auth:", rollbackError);
      }

      return jsonResponse(
        { error: "Erro ao salvar perfil do usuário no sistema" },
        500,
      );
    }

    console.log("✅ Usuário salvo na tabela usuarios:", usuarioCriado.id);

    try {
      await supabase.from("auditoria").insert([
        {
          usuario: callerProfile.nome || callerProfile.email,
          perfil: callerPerfil,
          tipo_evento: "usuario",
          modulo: "Configurações",
          acao: "criou usuário",
          usuario_alvo: nome,
          perfil_alvo: perfilNovo,
          autenticacao: "sessao_propria",
          status: "sucesso",
          observacao: "Usuário criado via Edge Function create-user",
          contexto: {
            email,
            matricula,
            funcao,
            tipo_visao,
            loja_codigo,
            loja_vinculada,
            regional_vinculada,
            subregional_vinculada,
          },
        },
      ]);

      console.log("📋 Log administrativo registrado");
    } catch (erroLog) {
      console.warn("⚠️ Não foi possível registrar log administrativo:", erroLog);
    }

    return jsonResponse({
      success: true,
      message: "Usuário criado com sucesso",
      data: {
        id: usuarioCriado.id,
        auth_user_id: authUserId,
        nome,
        email,
        matricula,
        funcao,
        perfil: perfilNovo,
        tipo_visao,
        loja_codigo,
        loja_vinculada,
        regional_vinculada,
        subregional_vinculada,
        senha_temporaria: senhaTemporaria,
      },
    });
  } catch (error) {
    console.error("❌ Erro inesperado na Edge Function create-user:", error);

    const mensagem =
      error instanceof Error
        ? error.message
        : "Erro inesperado ao criar usuário";

    return jsonResponse({ error: mensagem }, 500);
  }
});
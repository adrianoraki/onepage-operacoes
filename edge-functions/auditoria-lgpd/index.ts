// ============================================================
// 🛡️ EDGE FUNCTION — auditoria-lgpd (agendada / cron mensal)
// ------------------------------------------------------------
// Roda no SERVIDOR (Deno). Audita a CONFIGURAÇÃO DO BANCO quanto
// à LGPD: RLS ativo nas tabelas sensíveis, políticas existentes,
// rotina de retenção, e exposição de dados. Grava o resultado em
// onepage.lgpd_auditorias e, se houver problema, deixa o alerta
// pronto para o sino do Master.
//
// Por que no banco e não no código? Uma Edge Function não acessa
// o código-fonte do front-end; ela enxerga o banco. Então aqui
// auditamos o que faz sentido no servidor.
//
// Deploy:
//   supabase functions deploy auditoria-lgpd
//
// PROJECT_URL/SERVICE_ROLE_KEY vêm dos nomes que o Supabase já injeta
// sozinho em toda Edge Function (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
// — não precisa configurar segredo nenhum manualmente.
//
// Agendamento (cron mensal — todo dia 1 às 03:00 UTC):
//   No painel do Supabase → Edge Functions → auditoria-lgpd →
//   Schedules → "0 3 1 * *"
//   (ou via SQL com pg_cron chamando a function; veja o .sql)
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PROJECT_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

// tabelas que DEVEM ter RLS ativo (contêm dados pessoais ou sensíveis)
const TABELAS_SENSIVEIS = [
  "usuarios",
  "auditoria",
  "painel_ouro_resultados",
  "lgpd_auditorias",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    // db.schema "onepage": as tabelas do OnePage vivem nesse schema no
    // projeto Supabase unificado com o StockFlow (ver Fase 2 da integração).
    const db = createClient(PROJECT_URL, SERVICE_ROLE_KEY, {
      db: { schema: "onepage" },
    });
    const checks: Array<{ item: string; nivel: string; status: string; detalhe: string }> = [];
    const add = (item: string, nivel: string, ok: boolean, detalhe: string) =>
      checks.push({ item, nivel, status: ok ? "ok" : "falha", detalhe });

    // ----------------------------------------------------------
    // 1) RLS ativo nas tabelas sensíveis
    // ----------------------------------------------------------
    const { data: rlsRows, error: rlsErr } = await db
      .from("pg_tables")
      .select("tablename, rowsecurity")
      .eq("schemaname", "onepage");

    if (rlsErr) {
      // fallback: consulta via rpc se a leitura direta de pg_tables não for permitida
      add("Leitura de metadados (RLS)", "AVISO", false,
        "Não foi possível ler pg_tables diretamente: " + rlsErr.message);
    } else {
      for (const t of TABELAS_SENSIVEIS) {
        const row = (rlsRows || []).find((r: any) => r.tablename === t);
        if (!row) {
          add(`Tabela ${t}`, "AVISO", false, "Tabela não encontrada (ok se ainda não criada).");
        } else {
          add(`RLS em ${t}`, "CRÍTICO", !!row.rowsecurity,
            row.rowsecurity ? "RLS ativo." : "RLS DESATIVADO — dados podem ficar expostos!");
        }
      }
    }

    // ----------------------------------------------------------
    // 2) Políticas RLS existem para as tabelas sensíveis
    // ----------------------------------------------------------
    const { data: pols } = await db
      .from("pg_policies")
      .select("tablename, policyname")
      .eq("schemaname", "onepage");
    for (const t of TABELAS_SENSIVEIS) {
      const qtd = (pols || []).filter((p: any) => p.tablename === t).length;
      add(`Políticas em ${t}`, "CRÍTICO", qtd > 0,
        qtd > 0 ? `${qtd} política(s) ativa(s).` : "Sem políticas — RLS sem regra bloqueia tudo ou nada.");
    }

    // ----------------------------------------------------------
    // 3) Retenção de auditoria — existem registros muito antigos?
    //    (LGPD: não guardar dados além do necessário)
    // ----------------------------------------------------------
    const limite = new Date();
    limite.setMonth(limite.getMonth() - 12); // > 12 meses = revisar
    const { count: antigos } = await db
      .from("auditoria")
      .select("*", { count: "exact", head: true })
      .lt("criado_em", limite.toISOString());
    add("Retenção de auditoria", "AVISO", !antigos || antigos === 0,
      antigos && antigos > 0
        ? `${antigos} registro(s) de auditoria com mais de 12 meses — avaliar expurgo.`
        : "Sem registros além do prazo de retenção.");

    // ----------------------------------------------------------
    // 4) Minimização — coluna de e-mail preenchida desnecessariamente?
    //    (heurística leve: conta usuários com e-mail externo real)
    // ----------------------------------------------------------
    const { count: comEmailExterno } = await db
      .from("usuarios")
      .select("*", { count: "exact", head: true })
      .not("email", "is", null)
      .not("email", "ilike", "%@onepage.sys");
    add("Minimização de e-mail", "INFO", true,
      `${comEmailExterno || 0} usuário(s) com e-mail externo cadastrado (informativo).`);

    // ----------------------------------------------------------
    // consolida resultado
    // ----------------------------------------------------------
    const total = checks.length;
    const ok = checks.filter((c) => c.status === "ok").length;
    const criticos = checks.filter((c) => c.nivel === "CRÍTICO" && c.status === "falha").length;
    const alertas = checks.filter((c) => c.nivel === "AVISO" && c.status === "falha").length;
    const pontuacao = total > 0 ? Math.round((ok / total) * 100) : 0;

    const { error: insErr } = await db.from("lgpd_auditorias").insert({
      pontuacao,
      total_itens: total,
      ok_itens: ok,
      alertas,
      criticos,
      detalhe: checks,
      lido: false,
      origem: "edge-cron",
    });
    if (insErr) return json({ error: "Falha ao gravar auditoria: " + insErr.message }, 500);

    return json({
      ok: true,
      pontuacao,
      criticos,
      alertas,
      resumo: `${ok}/${total} verificações OK`,
    });
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500);
  }
});

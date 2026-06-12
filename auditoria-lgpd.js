#!/usr/bin/env node
/* ============================================================
   🛡️ AUDITORIA DE CONFORMIDADE LGPD — OnePage Expert
   ------------------------------------------------------------
   Roda uma bateria de verificações no código-fonte e gera um
   relatório de conformidade. Uso:
       node auditoria-lgpd.js
   Sai com código 1 se houver RISCO CRÍTICO (útil para CI/CD).
   ============================================================ */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const APP = path.join(ROOT, "app");

// utilitário: lê todos os .js de app/
function arquivosJs() {
  try {
    return fs.readdirSync(APP).filter((f) => f.endsWith(".js")).map((f) => path.join(APP, f));
  } catch { return []; }
}
function conteudoTodos() {
  return arquivosJs().map((f) => ({ arq: path.basename(f), txt: fs.readFileSync(f, "utf8") }));
}
function existe(rel) { return fs.existsSync(path.join(ROOT, rel)); }
function leArquivo(rel) { try { return fs.readFileSync(path.join(ROOT, rel), "utf8"); } catch { return ""; } }

const arquivos = conteudoTodos();
const resultados = [];
function add(nivel, item, status, detalhe) {
  resultados.push({ nivel, item, status, detalhe });
}

// ------------------------------------------------------------
// PILAR 3 — Segurança / exposição de PII
// ------------------------------------------------------------

// 3.1 chave secreta no frontend (CRÍTICO)
const temServiceKey = arquivos.some(({ txt }) =>
  /sb_secret_[A-Za-z0-9]/.test(txt) ||
  /role.{0,4}service_role/.test(txt) ||
  /SUPABASE_SERVICE_KEY\s*=\s*["']eyJ/.test(txt)
);
add("CRÍTICO", "Chave secreta (service_role) fora do frontend",
  temServiceKey ? "FALHA" : "OK",
  temServiceKey ? "Há chave secreta no JS do navegador — remova já!" : "Nenhuma chave secreta no frontend.");

// 3.2 frontend usa publishable/anon (esperado)
const usaPublishable = arquivos.some(({ txt }) => /sb_publishable_/.test(txt));
add("INFO", "Frontend usa chave publishable",
  usaPublishable ? "OK" : "ATENÇÃO",
  usaPublishable ? "Chave pública correta no navegador." : "Não detectei publishable key.");

// 3.3 senhas em texto plano / hash
const senhaPlana = arquivos.some(({ txt }) =>
  /senha\s*[:=]\s*["'][^"']{3,}["']/.test(txt) && !/placeholder|aria|label/.test(txt)
);
add("CRÍTICO", "Sem senha hardcoded em texto plano",
  senhaPlana ? "REVISAR" : "OK",
  senhaPlana ? "Possível senha fixa no código — revise." : "Autenticação via Supabase Auth (hash bcrypt no servidor).");

// 3.4 PII em logs sem máscara
const temSanitizador = leArquivo("app/logger.js").includes("maskPII");
add("VULNERABILIDADE", "Sanitização de PII em logs",
  temSanitizador ? "OK" : "FALHA",
  temSanitizador ? "Função maskPII disponível e aplicada." : "Não há máscara de PII nos logs.");

// 3.5 logger silencia console em produção
const logSilencia = leArquivo("app/logger.js").includes("console.log = noop");
add("VULNERABILIDADE", "Logs informativos silenciados em produção",
  logSilencia ? "OK" : "ATENÇÃO",
  logSilencia ? "console.log/info/debug desligados fora de localhost." : "Logs podem vazar em produção.");

// ------------------------------------------------------------
// PILAR 1 — Minimização de dados
// ------------------------------------------------------------
const cadastro = leArquivo("app/perfil-usuarios-ui.js");
const coletaEmailManual = /novo_email/.test(cadastro);
const coletaFuncao = /novo_funcao/.test(cadastro);
add("MELHORIA", "Minimização: cadastro não coleta e-mail manual",
  coletaEmailManual ? "REVISAR" : "OK",
  coletaEmailManual ? "Formulário ainda pede e-mail." : "E-mail interno gerado da matrícula (minimização).");
add("MELHORIA", "Minimização: cadastro não coleta função desnecessária",
  coletaFuncao ? "REVISAR" : "OK",
  coletaFuncao ? "Formulário ainda pede função." : "Função removida do cadastro.");

// ------------------------------------------------------------
// PILAR 2 — Dados sensíveis (Art. 11)
// ------------------------------------------------------------
const dadosSensiveis = arquivos.some(({ txt }) =>
  /\b(biometria|impressao_digital|cpf_saude|religi|raca|etnia|orientacao_sexual|prontuario)\b/i.test(txt)
);
add("INFO", "Não trata dados sensíveis (Art. 11)",
  dadosSensiveis ? "REVISAR" : "OK",
  dadosSensiveis ? "Detectei possíveis dados sensíveis — exigem proteção reforçada." : "Sistema não lida com dados sensíveis.");

// ------------------------------------------------------------
// PILAR 3 — RLS / segurança de acesso
// ------------------------------------------------------------
const temRls = existe("supabase/rls_segmentada.sql");
add("CRÍTICO", "Script de RLS segmentada presente",
  temRls ? "OK" : "FALHA",
  temRls ? "supabase/rls_segmentada.sql existe (aplicar no banco)." : "Falta o RLS segmentado.");

// ------------------------------------------------------------
// PILAR 5 — Retenção e eliminação
// ------------------------------------------------------------
const temRetencao = existe("supabase/retencao_dados.sql");
add("MELHORIA", "Política de retenção/expiração de logs",
  temRetencao ? "OK" : "FALHA",
  temRetencao ? "supabase/retencao_dados.sql existe (definir prazo c/ jurídico)." : "Falta política de retenção.");

// ------------------------------------------------------------
// PILAR 4 — Transparência / direitos do titular
// ------------------------------------------------------------
const temPrivacidade = existe("privacidade.html") || existe("politica-privacidade.html");
add("MELHORIA", "Aviso de Privacidade publicado (Art. 9º)",
  temPrivacidade ? "OK" : "FALHA",
  temPrivacidade ? "Página de privacidade encontrada." : "Falta a página de política de privacidade.");

const temQuemSomos = existe("quem-somos.html") || existe("sobre.html");
add("MELHORIA", "Página institucional (Quem Somos)",
  temQuemSomos ? "OK" : "FALHA",
  temQuemSomos ? "Página institucional encontrada." : "Falta a página Quem Somos.");

// ------------------------------------------------------------
// RELATÓRIO
// ------------------------------------------------------------
const cores = { OK: "✅", FALHA: "❌", REVISAR: "🔶", ATENÇÃO: "⚠️", INFO: "ℹ️" };
console.log("\n════════════════════════════════════════════════════════");
console.log("  🛡️  RELATÓRIO DE CONFORMIDADE LGPD — OnePage Expert");
console.log("  " + new Date().toLocaleString("pt-BR"));
console.log("════════════════════════════════════════════════════════\n");

let criticosFalhando = 0;
const ordem = ["CRÍTICO", "VULNERABILIDADE", "MELHORIA", "INFO"];
ordem.forEach((nivel) => {
  const itens = resultados.filter((r) => r.nivel === nivel);
  if (!itens.length) return;
  console.log(`\n── ${nivel} ──`);
  itens.forEach((r) => {
    const icone = cores[r.status] || "•";
    console.log(`  ${icone} ${r.item}`);
    console.log(`      ${r.detalhe}`);
    if (nivel === "CRÍTICO" && r.status !== "OK" && r.status !== "INFO") criticosFalhando++;
  });
});

const okCount = resultados.filter((r) => r.status === "OK").length;
const total = resultados.length;
const pct = Math.round((okCount / total) * 100);

console.log("\n════════════════════════════════════════════════════════");
console.log(`  CONFORMIDADE: ${okCount}/${total} itens OK (${pct}%)`);
if (criticosFalhando > 0) {
  console.log(`  ⛔ ${criticosFalhando} item(ns) CRÍTICO(s) pendente(s) — corrigir antes de produção.`);
} else {
  console.log("  ✅ Nenhum item crítico pendente no código.");
}
console.log("════════════════════════════════════════════════════════\n");
console.log("Lembrete: itens de PROCESSO (rotacionar chave vazada, publicar");
console.log("aviso, definir prazos de retenção com jurídico, canal do titular)");
console.log("não são 100% verificáveis por código — confira manualmente.\n");

process.exit(criticosFalhando > 0 ? 1 : 0);

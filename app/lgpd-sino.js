// ============================================================
// 🔔 SINO DE ALERTAS LGPD — visível somente para o MASTER
// ------------------------------------------------------------
// Adiciona um sino no header (ao lado do perfil). Quando há uma
// auditoria mensal com alertas/críticos ainda não lidos, mostra
// um badge vermelho. Ao clicar, abre um popover com o resumo da
// última auditoria e permite marcar como lido.
//
// Só aparece para usuários com perfil "master". Os dados vêm da
// tabela lgpd_auditorias (protegida por RLS — só master lê).
// ============================================================
(function () {
  "use strict";

  let ehMaster = null;        // cache do perfil
  let ultimaAuditoria = null; // cache da última auditoria

  async function verificarMaster() {
    if (ehMaster !== null) return ehMaster;
    try {
      const { data: sess } = await window.db.auth.getUser();
      const uid = sess?.user?.id;
      if (!uid) return (ehMaster = false);
      const { data } = await window.db
        .from("usuarios").select("perfil")
        .eq("auth_user_id", uid).maybeSingle();
      ehMaster = !!data && String(data.perfil || "").toLowerCase() === "master";
    } catch (_) { ehMaster = false; }
    return ehMaster;
  }

  async function buscarUltimaAuditoria() {
    try {
      const { data } = await window.db
        .from("lgpd_auditorias")
        .select("*")
        .order("criado_em", { ascending: false })
        .limit(1)
        .maybeSingle();
      ultimaAuditoria = data || null;
    } catch (_) { ultimaAuditoria = null; }
    return ultimaAuditoria;
  }

  function temPendencia(a) {
    if (!a) return false;
    return !a.lido && ((a.criticos || 0) > 0 || (a.alertas || 0) > 0);
  }

  function injetarEstilos() {
    if (document.getElementById("lgpd-sino-css")) return;
    const s = document.createElement("style");
    s.id = "lgpd-sino-css";
    s.textContent = `
      .lgpd-sino { position: relative; width: 40px; height: 40px; border-radius: 10px;
        border: 1px solid rgba(201,162,39,0.3); background: rgba(201,162,39,0.08);
        color: #a07a15; font-size: 17px; cursor: pointer; display: inline-flex;
        align-items: center; justify-content: center; transition: all 0.15s; }
      .lgpd-sino:hover { background: rgba(201,162,39,0.18); }
      .lgpd-sino-badge { position: absolute; top: -4px; right: -4px; min-width: 18px; height: 18px;
        padding: 0 5px; border-radius: 999px; background: #e24b4a; color: #fff;
        font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center;
        border: 2px solid var(--app-bg, #fff); }
      .lgpd-pop { position: fixed; width: min(360px, calc(100vw - 16px));
        background: var(--lgpd-card, #fff); border-radius: 16px; box-shadow: 0 18px 50px rgba(0,0,0,0.22);
        border: 1px solid #e8edf2; z-index: 100000; overflow: hidden;
        animation: lgpdPopIn 0.16s ease; }
      @keyframes lgpdPopIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
      .lgpd-pop-head { padding: 14px 16px; border-bottom: 1px solid #eef1f5;
        display: flex; align-items: center; justify-content: space-between; }
      .lgpd-pop-head h4 { margin: 0; font-size: 14px; font-weight: 800; color: #1f2a37; }
      .lgpd-pop-body { padding: 14px 16px; max-height: 340px; overflow-y: auto; }
      .lgpd-score { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
      .lgpd-score-num { font-size: 30px; font-weight: 800; }
      .lgpd-chip { display: inline-block; font-size: 11px; font-weight: 700; border-radius: 999px;
        padding: 2px 10px; margin-right: 6px; }
      .lgpd-chip.crit { background: rgba(226,75,74,0.12); color: #c0392b; border: 1px solid rgba(226,75,74,0.3); }
      .lgpd-chip.warn { background: rgba(201,162,39,0.14); color: #9a7b1c; border: 1px solid rgba(201,162,39,0.3); }
      .lgpd-chip.ok { background: rgba(30,125,69,0.12); color: #1e7d45; border: 1px solid rgba(30,125,69,0.3); }
      .lgpd-item { font-size: 12.5px; padding: 7px 0; border-bottom: 1px solid #f2f5f8;
        display: flex; gap: 8px; align-items: flex-start; }
      .lgpd-item:last-child { border-bottom: none; }
      .lgpd-item .ic { font-size: 13px; margin-top: 1px; }
      .lgpd-item .tx { flex: 1; color: #4b5b6b; }
      .lgpd-item .tx b { color: #1f2a37; }
      .lgpd-pop-foot { padding: 12px 16px; border-top: 1px solid #eef1f5; }
      .lgpd-btn-lido { width: 100%; padding: 9px; border: none; border-radius: 9px;
        background: linear-gradient(135deg,#e8c84a,#c9a227); color: #4a3700;
        font-weight: 700; font-size: 13px; cursor: pointer; }
      .lgpd-btn-lido:hover { filter: brightness(1.05); }
      .lgpd-vazio { text-align: center; color: #9aabb7; font-size: 13px; padding: 18px 0; }
    `;
    document.head.appendChild(s);
  }

  function corPont(p) {
    return p >= 90 ? "#1e7d45" : p >= 70 ? "#a07a15" : "#c0392b";
  }

  function montarPopover(a) {
    if (!a) {
      return `<div class="lgpd-vazio">Nenhuma auditoria registrada ainda.<br>
        A próxima roda automaticamente no início do mês.</div>`;
    }
    const data = new Date(a.criado_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    const itens = (Array.isArray(a.detalhe) ? a.detalhe : [])
      .filter(c => c.status === "falha")
      .map(c => {
        const ic = c.nivel === "CRÍTICO" ? "🔴" : c.nivel === "AVISO" ? "🟡" : "🔵";
        return `<div class="lgpd-item"><span class="ic">${ic}</span>
          <span class="tx"><b>${c.item}</b><br>${c.detalhe}</span></div>`;
      }).join("");

    return `
      <div class="lgpd-score">
        <div class="lgpd-score-num" style="color:${corPont(a.pontuacao)}">${a.pontuacao}%</div>
        <div>
          <div style="font-size:12px;color:#5b6b7d;margin-bottom:4px;">conformidade · auditoria de ${data}</div>
          <div>
            ${a.criticos > 0 ? `<span class="lgpd-chip crit">${a.criticos} crítico(s)</span>` : ""}
            ${a.alertas > 0 ? `<span class="lgpd-chip warn">${a.alertas} aviso(s)</span>` : ""}
            ${a.criticos === 0 && a.alertas === 0 ? `<span class="lgpd-chip ok">tudo certo</span>` : ""}
          </div>
        </div>
      </div>
      ${itens || `<div class="lgpd-vazio">Nenhuma pendência nesta auditoria. 👍</div>`}
    `;
  }

  async function marcarLido(id) {
    try {
      await window.db.from("lgpd_auditorias").update({ lido: true }).eq("id", id);
      if (ultimaAuditoria) ultimaAuditoria.lido = true;
    } catch (_) {}
    atualizarBadge();
    fecharPopover();
  }

  function fecharPopover() {
    const p = document.getElementById("lgpd-pop");
    if (p) p.remove();
    document.removeEventListener("click", fecharAoClicarFora);
    window.removeEventListener("resize", reposicionar);
    window.removeEventListener("scroll", reposicionar, true);
  }

  async function abrirPopover(ev) {
    ev?.stopPropagation();
    if (document.getElementById("lgpd-pop")) { fecharPopover(); return; }
    const sino = document.getElementById("lgpd-sino");
    if (!sino) return;
    const a = ultimaAuditoria || await buscarUltimaAuditoria();
    const pop = document.createElement("div");
    pop.id = "lgpd-pop";
    pop.className = "lgpd-pop";
    pop.innerHTML = `
      <div class="lgpd-pop-head"><h4>🛡️ Conformidade LGPD</h4></div>
      <div class="lgpd-pop-body">${montarPopover(a)}</div>
      ${a && temPendencia(a) ? `<div class="lgpd-pop-foot">
        <button class="lgpd-btn-lido" id="lgpd-btn-lido">Marcar como visto</button></div>` : ""}
    `;
    // anexa ao BODY (não ao header) para escapar do stacking context do backdrop-filter
    document.body.appendChild(pop);
    posicionarPopover(pop, sino);

    const btn = document.getElementById("lgpd-btn-lido");
    if (btn) btn.onclick = () => marcarLido(a.id);
    setTimeout(() => {
      document.addEventListener("click", fecharAoClicarFora);
      window.addEventListener("resize", reposicionar);
      window.addEventListener("scroll", reposicionar, true);
    }, 0);
  }

  function posicionarPopover(pop, sino) {
    const r = sino.getBoundingClientRect();
    const larg = pop.offsetWidth || 360;
    let left = r.right - larg;            // alinha a borda direita do popover com o sino
    if (left < 8) left = 8;               // não deixa sair pela esquerda
    const maxLeft = window.innerWidth - larg - 8;
    if (left > maxLeft) left = maxLeft;
    pop.style.left = left + "px";
    pop.style.top = (r.bottom + 10) + "px";
  }
  function reposicionar() {
    const pop = document.getElementById("lgpd-pop");
    const sino = document.getElementById("lgpd-sino");
    if (pop && sino) posicionarPopover(pop, sino);
  }

  function fecharAoClicarFora(e) {
    const pop = document.getElementById("lgpd-pop");
    const sino = document.getElementById("lgpd-sino");
    if (pop && !pop.contains(e.target) && sino && !sino.contains(e.target)) {
      fecharPopover();
    }
  }

  function atualizarBadge() {
    const sino = document.getElementById("lgpd-sino");
    if (!sino) return;
    const antigo = sino.querySelector(".lgpd-sino-badge");
    if (antigo) antigo.remove();
    if (temPendencia(ultimaAuditoria)) {
      const n = (ultimaAuditoria.criticos || 0) + (ultimaAuditoria.alertas || 0);
      const badge = document.createElement("span");
      badge.className = "lgpd-sino-badge";
      badge.textContent = n > 9 ? "9+" : String(n);
      sino.appendChild(badge);
    }
  }

  // injeta o sino no header (lado direito, antes do perfil)
  async function montarSino() {
    if (!(await verificarMaster())) return; // só master vê
    const dir = document.querySelector("#app-header .ah-dir");
    if (!dir || document.getElementById("lgpd-sino")) return;

    injetarEstilos();
    const sino = document.createElement("button");
    sino.type = "button";
    sino.id = "lgpd-sino";
    sino.className = "lgpd-sino";
    sino.title = "Conformidade LGPD";
    sino.innerHTML = `<i class="fas fa-bell"></i>`;
    sino.onclick = abrirPopover;
    dir.insertBefore(sino, dir.firstChild);

    await buscarUltimaAuditoria();
    atualizarBadge();
  }

  // tenta montar periodicamente (o header é recriado ao trocar de tela)
  window.montarSinoLGPD = montarSino;
  document.addEventListener("DOMContentLoaded", () => {
    setInterval(montarSino, 1500);
  });
})();

// ============================================================
// ☁️ PAINEL DE OURO — lancamento/supabase-sync.js
// Helper compartilhado de persistência no Supabase para TODOS
// os módulos de lançamento (vendas, quebras, frente-caixa, ...).
//
// Salva/carrega na MESMA tabela usada pelo ranking do painel:
//   painel_ouro_resultados
//   (unique: loja_codigo, area_slug, ano, mes)
//
// API exposta:
//   window.poSync.salvar(slug, ano, mes, payloads)  → upsert
//   window.poSync.carregar(slug, ano, mes)          → { loja: sub_resultados[] }
//   window.poSync.toast(msg, ok)                    → feedback visual
// ============================================================
console.log("✅ supabase-sync.js carregado");

(function () {
  // ---- Estilos do botão salvar + toast (injetados uma vez) ----
  if (!document.getElementById("po-sync-styles")) {
    const s = document.createElement("style");
    s.id = "po-sync-styles";
    s.textContent = `
      .po-supabase-bar {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 16px;
        padding-top: 14px;
        border-top: 1px solid #efe9d8;
      }
      .po-supabase-info {
        font-size: 11px;
        color: #a08a3c;
        font-weight: 600;
        margin-right: auto;
      }
      .po-supabase-btn {
        height: 38px;
        padding: 0 22px;
        border: none;
        border-radius: 9px;
        background: linear-gradient(135deg, #c9a227, #a07a15);
        color: #fff;
        font-family: inherit;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 3px 10px rgba(201,162,39,0.25);
        transition: all 0.15s;
      }
      .po-supabase-btn:hover { filter: brightness(1.08); }
      .po-supabase-btn:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }
      .po-sync-toast {
        position: fixed;
        bottom: 28px;
        right: 28px;
        z-index: 9100;
        padding: 13px 22px;
        border-radius: 10px;
        font-family: "Poppins", Inter, sans-serif;
        font-size: 12px;
        font-weight: 700;
        color: #fff;
        opacity: 0;
        transform: translateY(8px);
        transition: all 0.2s;
        pointer-events: none;
      }
      .po-sync-toast.visivel { opacity: 1; transform: translateY(0); }
      .po-sync-toast.ok  { background: rgba(46,160,98,0.96); }
      .po-sync-toast.err { background: rgba(231,76,60,0.96); }
    `;
    document.head.appendChild(s);
  }

  function toast(msg, ok = true, dur = 3500) {
    let el = document.getElementById("po-sync-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "po-sync-toast";
      document.body.appendChild(el);
    }
    el.className = `po-sync-toast ${ok ? "ok" : "err"}`;
    el.textContent = msg;
    el.classList.add("visivel");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("visivel"), dur);
  }

  function clienteDisponivel() {
    return !!(window.db && typeof window.db.from === "function");
  }

  /**
   * Upsert dos lançamentos de uma área no Supabase.
   * payloads: [{ loja_codigo, pontuacao_obtida, pontuacao_maxima, sub_resultados }]
   */
  async function salvar(slug, ano, mes, payloads) {
    if (!clienteDisponivel()) {
      throw new Error("Conexão com o banco indisponível (faça login novamente).");
    }
    let userId = null;
    try {
      const { data } = await window.db.auth.getUser();
      userId = data?.user?.id || null;
    } catch (e) { /* segue sem usuário */ }

    const agora = new Date().toISOString();
    const rows = payloads.map(p => ({
      ...p,
      area_slug: slug,
      ano: Number(ano),
      mes: Number(mes),
      lancado_por: userId,
      lancado_em: agora,
      ativo: true,
    }));

    const { error } = await window.db
      .from("painel_ouro_resultados")
      .upsert(rows, { onConflict: "loja_codigo,area_slug,ano,mes", ignoreDuplicates: false });
    if (error) throw error;
    return rows.length;
  }

  /**
   * Carrega lançamentos existentes de uma área/período.
   * Retorna { [loja_codigo]: sub_resultados[] } ou null em caso de falha.
   */
  async function carregar(slug, ano, mes) {
    if (!clienteDisponivel()) return null;
    const { data, error } = await window.db
      .from("painel_ouro_resultados")
      .select("loja_codigo, sub_resultados")
      .eq("area_slug", slug)
      .eq("ano", Number(ano))
      .eq("mes", Number(mes))
      .eq("ativo", true);
    if (error) {
      console.error("☁️ poSync | erro ao carregar", slug, error);
      return null;
    }
    const mapa = {};
    (data || []).forEach(r => { mapa[r.loja_codigo] = r.sub_resultados || []; });
    return mapa;
  }

  /**
   * Cria a barra padrão com botão "Salvar no banco" para os módulos.
   * onSalvar(btn) é chamado no clique.
   */
  function criarBarraSalvar(onSalvar) {
    const bar = document.createElement("div");
    bar.className = "po-supabase-bar";

    const info = document.createElement("span");
    info.className = "po-supabase-info";
    info.textContent = "Os dados digitados ficam guardados localmente; clique para gravar no banco.";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "po-supabase-btn";
    btn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Salvar no banco';
    btn.addEventListener("click", () => onSalvar(btn));

    bar.appendChild(info);
    bar.appendChild(btn);
    return bar;
  }

  window.poSync = { salvar, carregar, toast, criarBarraSalvar };
})();

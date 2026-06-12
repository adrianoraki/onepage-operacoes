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
      .po-supabase-btn-limpar {
        height: 38px; padding: 0 16px; border: 1px solid #d9b3ac; border-radius: 9px;
        background: #fff; color: #b5483b; font-family: inherit; font-size: 12px;
        font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 7px;
        transition: all 0.15s;
      }
      .po-supabase-btn-limpar:hover { background: #fbeae7; }
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
      .po-auto-status {
        position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%) translateY(8px);
        z-index: 9100; padding: 9px 18px; border-radius: 999px;
        font-family: "Poppins", Inter, sans-serif; font-size: 12px; font-weight: 700;
        color: #fff; opacity: 0; transition: all 0.2s; pointer-events: none;
        display: flex; align-items: center; gap: 8px;
      }
      .po-auto-status.visivel { opacity: 1; transform: translateX(-50%) translateY(0); }
      .po-auto-status.salvando { background: rgba(201,162,39,0.96); }
      .po-auto-status.salvo    { background: rgba(46,160,98,0.96); }
      .po-auto-status.erro     { background: rgba(231,76,60,0.96); }
      .po-auto-dot {
        width: 10px; height: 10px; border: 2px solid rgba(255,255,255,0.5);
        border-top-color: #fff; border-radius: 50%; animation: poAutoSpin 0.6s linear infinite;
      }
      @keyframes poAutoSpin { to { transform: rotate(360deg); } }
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
    info.textContent = "Salvamento automático ao sair de cada campo. Use o botão para gravar tudo de uma vez.";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "po-supabase-btn";
    btn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Salvar tudo agora';
    btn.addEventListener("click", () => onSalvar(btn));

    bar.appendChild(info);
    bar.appendChild(btn);
    return bar;
  }

  /**
   * Salva UMA loja (uma linha) com auto-save por blur, em fila/debounce
   * por loja para não disparar várias gravações simultâneas.
   * payload = { loja_codigo, pontuacao_obtida, pontuacao_maxima, sub_resultados }
   * Mostra um indicador discreto de status (salvando / salvo / erro).
   */
  const _filaAuto = {};        // chave: slug|ano|mes|loja → timeout
  async function _gravarLinha(slug, ano, mes, payload) {
    if (!clienteDisponivel()) throw new Error("Banco indisponível");
    let userId = null;
    try { const { data } = await window.db.auth.getUser(); userId = data?.user?.id || null; } catch (e) {}
    const row = {
      ...payload,
      area_slug: slug, ano: Number(ano), mes: Number(mes),
      lancado_por: userId, lancado_em: new Date().toISOString(), ativo: true,
    };
    const { error } = await window.db
      .from("painel_ouro_resultados")
      .upsert([row], { onConflict: "loja_codigo,area_slug,ano,mes", ignoreDuplicates: false });
    if (error) throw error;
  }

  function statusAuto(estado) {
    // estado: "salvando" | "salvo" | "erro"
    let el = document.getElementById("po-auto-status");
    if (!el) {
      el = document.createElement("div");
      el.id = "po-auto-status";
      el.className = "po-auto-status";
      document.body.appendChild(el);
    }
    if (estado === "salvando") { el.className = "po-auto-status salvando visivel"; el.innerHTML = '<span class="po-auto-dot"></span> Salvando…'; }
    else if (estado === "salvo") { el.className = "po-auto-status salvo visivel"; el.innerHTML = "✓ Salvo no banco"; clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("visivel"), 1600); }
    else { el.className = "po-auto-status erro visivel"; el.innerHTML = "✕ Erro ao salvar"; clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("visivel"), 4000); }
  }

  /**
   * Auto-save por loja: agenda a gravação ~400ms após o último blur,
   * agrupando edições rápidas na mesma loja.
   */
  function salvarUmaLoja(slug, ano, mes, payload) {
    if (!payload || !payload.loja_codigo) return;
    const chave = `${slug}|${ano}|${mes}|${payload.loja_codigo}`;
    clearTimeout(_filaAuto[chave]);
    _filaAuto[chave] = setTimeout(async () => {
      try {
        statusAuto("salvando");
        await _gravarLinha(slug, ano, mes, payload);
        statusAuto("salvo");
      } catch (err) {
        console.error("☁️ auto-save falhou", err);
        statusAuto("erro");
      }
    }, 400);
  }

  /**
   * Exclui o registro de UMA loja do banco (quando todos os campos foram
   * apagados). Sem isso, apagar tudo de uma loja deixava o registro órfão
   * no banco e os valores "voltavam" ao recarregar.
   */
  async function _excluirLinha(slug, ano, mes, lojaCodigo) {
    if (!clienteDisponivel()) throw new Error("Banco indisponível");
    const { error } = await window.db
      .from("painel_ouro_resultados")
      .delete()
      .eq("area_slug", slug)
      .eq("ano", Number(ano))
      .eq("mes", Number(mes))
      .eq("loja_codigo", lojaCodigo);
    if (error) throw error;
  }

  function excluirUmaLoja(slug, ano, mes, lojaCodigo) {
    if (!lojaCodigo) return;
    const chave = `${slug}|${ano}|${mes}|${lojaCodigo}`;
    clearTimeout(_filaAuto[chave]);
    _filaAuto[chave] = setTimeout(async () => {
      try {
        statusAuto("salvando");
        await _excluirLinha(slug, ano, mes, lojaCodigo);
        statusAuto("salvo");
      } catch (err) {
        console.error("☁️ exclusão falhou", err);
        statusAuto("erro");
      }
    }, 400);
  }

  window.poSync = { salvar, carregar, toast, criarBarraSalvar, salvarUmaLoja, excluirUmaLoja };
})();

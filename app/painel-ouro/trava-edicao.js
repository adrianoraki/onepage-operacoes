// ============================================================
// 🔒 TRAVA DE EDIÇÃO POR SEMESTRE — Painel de Ouro
// ------------------------------------------------------------
// Regra: quando um semestre encerra, os lançamentos daquele período
// ficam TRAVADOS contra edição. Para editar um período travado, é
// preciso desbloquear com usuário + senha de um MASTER.
//
// O desbloqueio é temporário (vale enquanto a sessão estiver aberta
// ou até o usuário re-travar), e fica registrado na auditoria.
// ============================================================
(function () {
  "use strict";

  // semestre de um mês: 1 (jan-jun) ou 2 (jul-dez)
  function semestreDoMes(mes) { return Number(mes) <= 6 ? 1 : 2; }

  // Um período (ano/mês) está num semestre ENCERRADO?
  // Encerrado = qualquer semestre anterior ao semestre corrente do ano corrente.
  function periodoEncerrado(ano, mes) {
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const semAtual = semestreDoMes(hoje.getMonth() + 1);
    const a = Number(ano), s = semestreDoMes(Number(mes));
    if (a < anoAtual) return true;            // ano passado: encerrado
    if (a > anoAtual) return false;           // ano futuro: aberto (não trava)
    return s < semAtual;                       // mesmo ano: semestre anterior está encerrado
  }

  // Guarda os desbloqueios temporários concedidos nesta sessão
  // chave: "ano-semestre" → true
  const desbloqueios = {};
  function chave(ano, mes) { return `${ano}-${semestreDoMes(mes)}`; }

  // Período está travado para edição AGORA?
  window.poPeriodoTravado = function (ano, mes) {
    if (!periodoEncerrado(ano, mes)) return false;      // semestre corrente/futuro: livre
    return !desbloqueios[chave(ano, mes)];               // encerrado: travado salvo se desbloqueado
  };

  // Concede desbloqueio temporário ao período
  function concederDesbloqueio(ano, mes) { desbloqueios[chave(ano, mes)] = true; }

  // ----------------------------------------------------------
  // Verifica usuário+senha de um MASTER (sem derrubar a sessão atual)
  // Usa um cliente Supabase TEMPORÁRIO para não afetar o login vigente.
  // ----------------------------------------------------------
  async function validarMaster(identificador, senha) {
    try {
      // resolve e-mail (aceita matrícula ou e-mail), igual ao login
      let email = (identificador || "").trim().toLowerCase();
      const DOMINIO_INTERNO = "onepage.sys";
      if (email.indexOf("@") < 0) {
        try {
          const { data: emailResolvido } = await window.db
            .rpc("email_por_matricula", { p_matricula: email });
          email = emailResolvido || `${email}@${DOMINIO_INTERNO}`;
        } catch (_) { email = `${email}@${DOMINIO_INTERNO}`; }
      }

      // cliente temporário (não persiste sessão) para validar a senha
      if (!window.supabase || !window.supabase.createClient) {
        return { ok: false, erro: "Biblioteca de auth indisponível." };
      }
      const url = window.SUPABASE_URL_PUBLIC || (window.db && window.db.supabaseUrl) || "";
      const key = window.SUPABASE_KEY_PUBLIC || "";
      const tmp = (url && key)
        ? window.supabase.createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
        : window.db; // fallback: usa o db (vai trocar a sessão — evitamos abaixo)

      const { data, error } = await tmp.auth.signInWithPassword({ email, password: senha });
      if (error || !data?.user) return { ok: false, erro: "Usuário ou senha inválidos." };

      // confere se o usuário é master
      const { data: perfil } = await window.db
        .from("usuarios").select("perfil, nome")
        .eq("auth_user_id", data.user.id).maybeSingle();

      // encerra a sessão temporária pra não vazar
      try { if (tmp !== window.db) await tmp.auth.signOut(); } catch (_) {}

      if (!perfil || String(perfil.perfil).toLowerCase() !== "master") {
        return { ok: false, erro: "Apenas um usuário MASTER pode desbloquear." };
      }
      return { ok: true, nome: perfil.nome || email };
    } catch (e) {
      return { ok: false, erro: "Falha ao validar: " + (e?.message || e) };
    }
  }

  // ----------------------------------------------------------
  // Modal de desbloqueio (usuário + senha do master)
  // Retorna uma Promise<boolean> — true se desbloqueou.
  // ----------------------------------------------------------
  window.poAbrirModalDesbloqueio = function (ano, mes) {
    return new Promise((resolve) => {
      let ov = document.getElementById("po-trava-overlay");
      if (ov) ov.remove();
      ov = document.createElement("div");
      ov.id = "po-trava-overlay";
      ov.className = "po-trava-overlay";
      const semestre = semestreDoMes(mes);
      ov.innerHTML = `
        <div class="po-trava-modal">
          <div class="po-trava-ico">🔒</div>
          <h3>Período travado</h3>
          <p>O ${semestre}º semestre de ${ano} está encerrado e protegido contra edição.
             Para editar, confirme as credenciais de um <b>usuário Master</b>.</p>
          <div class="po-trava-campo">
            <label>Matrícula ou e-mail do Master</label>
            <input type="text" id="po-trava-user" autocomplete="off" placeholder="Matrícula do Master">
          </div>
          <div class="po-trava-campo">
            <label>Senha</label>
            <input type="password" id="po-trava-senha" autocomplete="off" placeholder="Senha do Master">
          </div>
          <div class="po-trava-erro" id="po-trava-erro"></div>
          <div class="po-trava-acoes">
            <button type="button" class="po-trava-cancelar" id="po-trava-cancelar">Cancelar</button>
            <button type="button" class="po-trava-confirmar" id="po-trava-confirmar">🔓 Desbloquear</button>
          </div>
        </div>`;
      document.body.appendChild(ov);
      requestAnimationFrame(() => ov.classList.add("aberto"));

      const fechar = (resultado) => {
        ov.classList.remove("aberto");
        setTimeout(() => ov.remove(), 200);
        resolve(resultado);
      };

      ov.querySelector("#po-trava-cancelar").onclick = () => fechar(false);
      ov.addEventListener("click", (e) => { if (e.target === ov) fechar(false); });

      ov.querySelector("#po-trava-confirmar").onclick = async () => {
        const u = ov.querySelector("#po-trava-user").value;
        const s = ov.querySelector("#po-trava-senha").value;
        const erroEl = ov.querySelector("#po-trava-erro");
        const btn = ov.querySelector("#po-trava-confirmar");
        if (!u || !s) { erroEl.textContent = "Preencha usuário e senha."; return; }
        btn.disabled = true; btn.textContent = "Validando…";
        const r = await validarMaster(u, s);
        if (r.ok) {
          concederDesbloqueio(ano, mes);
          // registra na auditoria (best-effort)
          try {
            if (typeof window.registrarLog === "function") {
              window.registrarLog({
                tipo_evento: "desbloqueio_periodo",
                detalhe: `Período ${semestre}º sem/${ano} desbloqueado por ${r.nome}`,
              });
            }
          } catch (_) {}
          fechar(true);
        } else {
          erroEl.textContent = r.erro || "Não foi possível desbloquear.";
          btn.disabled = false; btn.textContent = "🔓 Desbloquear";
        }
      };
    });
  };

  // ----------------------------------------------------------
  // Guarda de salvamento: chame antes de salvar.
  // Se o período estiver travado, abre o modal; só prossegue se desbloquear.
  // Retorna Promise<boolean>.
  // ----------------------------------------------------------
  window.poVerificarTravaAntesDeSalvar = async function (ano, mes) {
    if (!window.poPeriodoTravado(ano, mes)) return true; // livre
    return await window.poAbrirModalDesbloqueio(ano, mes);
  };

  console.log("🔒 Trava de edição por semestre carregada.");
})();

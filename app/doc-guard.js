// ============================================================
// 🔐 TRAVA DE VISUALIZAÇÃO DE DOCUMENTOS — somente MASTER
// ------------------------------------------------------------
// Protege documentos internos (apresentação comercial, doc técnica,
// manual) caso fiquem acessíveis pelo site. Apenas usuários com
// perfil "master" conseguem abrir. Qualquer outro perfil — ou
// visitante não logado — é bloqueado.
//
// COMO USAR:
//   1) Coloque os PDFs numa pasta, ex.: /docs/
//   2) Crie uma página HTML (ex.: docs.html) que inclua este script.
//   3) Liste os documentos chamando poDocGuard.protegerLinks().
//   4) NUNCA referencie o PDF direto num <a href> público —
//      use os botões gerados aqui, que só funcionam para o Master.
// ============================================================
(function () {
  "use strict";

  // descobre o perfil do usuário logado consultando o banco
  async function obterPerfil() {
    try {
      if (!window.db || !window.db.auth) return null;
      const { data: sessao } = await window.db.auth.getUser();
      const user = sessao?.user;
      if (!user) return null;
      const { data: perfil } = await window.db
        .from("usuarios")
        .select("perfil, nome")
        .eq("auth_user_id", user.id)
        .maybeSingle();
      return perfil || null;
    } catch (e) {
      console.error("Falha ao verificar perfil:", e);
      return null;
    }
  }

  async function ehMaster() {
    const p = await obterPerfil();
    return !!p && String(p.perfil || "").toLowerCase() === "master";
  }

  // Abre um documento apenas se o usuário for Master.
  // Caso contrário, mostra aviso de acesso restrito.
  async function abrirSeMaster(caminhoDoc) {
    const liberado = await ehMaster();
    if (liberado) {
      window.open(caminhoDoc, "_blank", "noopener");
    } else {
      mostrarBloqueio();
    }
  }

  function mostrarBloqueio() {
    let ov = document.getElementById("doc-guard-overlay");
    if (ov) ov.remove();
    ov = document.createElement("div");
    ov.id = "doc-guard-overlay";
    ov.style.cssText = `
      position:fixed; inset:0; background:rgba(15,18,24,0.6); z-index:99999;
      display:flex; align-items:center; justify-content:center; backdrop-filter:blur(3px);`;
    ov.innerHTML = `
      <div style="width:min(420px,92vw); background:#fff; border-radius:18px; padding:30px; text-align:center;
                  box-shadow:0 20px 60px rgba(0,0,0,0.3); font-family:'Helvetica Neue',Arial,sans-serif;">
        <div style="font-size:40px; margin-bottom:10px;">🔐</div>
        <h3 style="font-size:19px; font-weight:800; color:#1f2a37; margin:0 0 8px;">Acesso restrito</h3>
        <p style="font-size:14px; color:#5b6b7d; line-height:1.5; margin:0 0 20px;">
          Este documento é confidencial e só pode ser aberto por um usuário <b>Master</b>.
          Se você precisa de acesso, fale com o responsável pelo sistema.
        </p>
        <button id="doc-guard-fechar"
          style="background:linear-gradient(135deg,#5a94e0,#2d7bb5); color:#fff; border:none;
                 border-radius:10px; padding:11px 26px; font-weight:700; font-size:14px; cursor:pointer;">
          Entendi
        </button>
      </div>`;
    document.body.appendChild(ov);
    ov.querySelector("#doc-guard-fechar").onclick = () => ov.remove();
    ov.addEventListener("click", (e) => { if (e.target === ov) ov.remove(); });
  }

  // Percorre elementos com [data-doc-master] e transforma em botões protegidos.
  // Exemplo de uso no HTML:
  //   <button data-doc-master="docs/MetricaOne-Apresentacao.pdf">Abrir apresentação</button>
  function protegerLinks() {
    document.querySelectorAll("[data-doc-master]").forEach((el) => {
      const caminho = el.getAttribute("data-doc-master");
      el.style.cursor = "pointer";
      el.addEventListener("click", (e) => {
        e.preventDefault();
        abrirSeMaster(caminho);
      });
    });
  }

  // Para páginas que SÓ devem ser vistas por Master (a página inteira):
  // chame poDocGuard.exigirMaster() no início; se não for master, redireciona.
  async function exigirMaster(redirecionarPara) {
    const liberado = await ehMaster();
    if (!liberado) {
      document.body.innerHTML = "";
      mostrarBloqueio();
      if (redirecionarPara) {
        setTimeout(() => { window.location.href = redirecionarPara; }, 2500);
      }
      return false;
    }
    return true;
  }

  window.poDocGuard = { ehMaster, abrirSeMaster, protegerLinks, exigirMaster };
  console.log("🔐 Trava de visualização de documentos (somente Master) carregada.");
})();

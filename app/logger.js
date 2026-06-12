/* ============================================================
   🪵 LOGGER CENTRAL — OnePage Expert
   Silencia logs informativos em PRODUÇÃO (evita expor permissões,
   dados de usuário e estrutura interna no console do navegador).
   Mantém warn/error, que são úteis para diagnosticar problemas reais.

   - Em localhost / 127.0.0.1  → modo desenvolvedor (todos os logs)
   - Em produção (Vercel etc.) → log/info/debug silenciados
   - Para depurar em produção:  ativarDebug(true)  e recarregar
                                ativarDebug(false) para desligar
   ============================================================ */
(function () {
  "use strict";

  // referências originais (preservadas para uso interno)
  var orig = {
    log: console.log ? console.log.bind(console) : function () {},
    info: console.info ? console.info.bind(console) : function () {},
    debug: console.debug ? console.debug.bind(console) : function () {},
    warn: console.warn ? console.warn.bind(console) : function () {},
    error: console.error ? console.error.bind(console) : function () {},
  };

  function noop() {}

  // detecta ambiente
  var host = (location && location.hostname) || "";
  var ehLocal =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host.endsWith(".local") ||
    location.protocol === "file:";

  var debugForcado = false;
  try {
    debugForcado = localStorage.getItem("onepage_debug") === "on";
  } catch (e) {
    debugForcado = false;
  }

  var DEV = ehLocal || debugForcado;

  // em PRODUÇÃO, silencia os logs informativos
  if (!DEV) {
    console.log = noop;
    console.info = noop;
    console.debug = noop;
    // console.warn e console.error são mantidos de propósito
  }

  // logger nomeado (opcional, para uso futuro no código)
  window.logger = {
    debug: DEV ? orig.debug : noop,
    info: DEV ? orig.info : noop,
    log: DEV ? orig.log : noop,
    warn: orig.warn,
    error: orig.error,
    isDev: DEV,
  };

  // interruptor manual de debug (use no console do navegador)
  window.ativarDebug = function (ligar) {
    try {
      if (ligar === false) {
        localStorage.removeItem("onepage_debug");
        orig.log("🔒 Debug DESLIGADO. Recarregue a página (Ctrl+Shift+R).");
      } else {
        localStorage.setItem("onepage_debug", "on");
        orig.log("🛠️ Debug LIGADO. Recarregue a página (Ctrl+Shift+R).");
      }
    } catch (e) {
      orig.error("Não foi possível alterar o modo debug:", e);
    }
  };

  // ============================================================
  // 🔒 SANITIZAÇÃO DE PII — mascara dados pessoais antes de logar.
  // Use window.maskPII(valor) ao registrar e-mail, nome, matrícula etc.
  // Em produção, mascara sempre; em dev, mantém legível para depurar.
  // ============================================================
  function mascararEmail(email) {
    if (typeof email !== "string" || email.indexOf("@") < 0) return "***";
    var p = email.split("@");
    var u = p[0] || "";
    var visivel = u.slice(0, 2);
    return visivel + "***@" + (p[1] || "");
  }
  function mascararTexto(txt) {
    if (typeof txt !== "string" || !txt) return "***";
    if (txt.length <= 2) return "***";
    return txt.slice(0, 1) + "***";
  }
  // Recebe um objeto e devolve cópia com campos sensíveis mascarados
  window.maskPII = function (obj) {
    try {
      if (DEV) return obj; // em desenvolvimento, não mascara (facilita depurar)
      if (obj == null) return obj;
      if (typeof obj === "string") return obj; // strings soltas: responsabilidade do chamador
      var SENS = ["email", "e-mail", "senha", "password", "matricula", "matrícula",
                  "cpf", "rg", "telefone", "celular", "token", "auth_user_id"];
      var NOMES = ["nome", "sobrenome", "nomeCompleto", "nome_completo"];
      var clone = Array.isArray(obj) ? [] : {};
      for (var k in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
        var kl = String(k).toLowerCase();
        var v = obj[k];
        if (kl.indexOf("email") >= 0 && typeof v === "string") clone[k] = mascararEmail(v);
        else if (SENS.indexOf(kl) >= 0) clone[k] = "***";
        else if (NOMES.indexOf(k) >= 0 || NOMES.indexOf(kl) >= 0) clone[k] = mascararTexto(v);
        else if (v && typeof v === "object") clone[k] = window.maskPII(v);
        else clone[k] = v;
      }
      return clone;
    } catch (e) { return "***"; }
  };
  window.maskEmail = mascararEmail;

  // aviso único de status (sempre visível, mesmo em produção)
  orig.log(
    DEV
      ? "🛠️ OnePage: modo desenvolvedor — logs ativos."
      : "🔒 OnePage: logs silenciados em produção. Use ativarDebug(true) para depurar."
  );
})();
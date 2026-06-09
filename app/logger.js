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

  // aviso único de status (sempre visível, mesmo em produção)
  orig.log(
    DEV
      ? "🛠️ OnePage: modo desenvolvedor — logs ativos."
      : "🔒 OnePage: logs silenciados em produção. Use ativarDebug(true) para depurar."
  );
})();
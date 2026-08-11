document.addEventListener("DOMContentLoaded", () => {
  const botao = document.getElementById("btnToggleSenha");
  const input = document.getElementById("senha");
  const icon = document.getElementById("iconToggleSenha");
  if (!botao || !input || !icon) return;

  botao.addEventListener("click", () => {
    const visivel = input.type === "text";
    input.type = visivel ? "password" : "text";
    icon.textContent = visivel ? "👁️" : "🙈";
  });
});
